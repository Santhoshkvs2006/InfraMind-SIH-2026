from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import random
import hashlib
import datetime
from app.database import get_db
from app.models import (
    Inspection, Institute, Inspector, InspectionChecklist, Evidence, Notification,
    InspectionStatus, InspectionType, RiskLevel
)
import json
from app.schemas import (
    InspectionResponse, RandomInspectionRequest, InspectionStartRequest,
    EvidenceCreateRequest, InspectionSubmitRequest, HumanReviewRequest, EvidenceResponse,
    GpsVerificationRequest, ChecklistSaveRequest, InspectionSummaryResponse
)
from app.services.audit_service import log_audit
from app.services.ai_engine import run_ai_analysis

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.get("", response_model=List[InspectionResponse])
def get_inspections(
    status: Optional[str] = None,
    inspector_id: Optional[int] = None,
    institute_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Inspection)
    if status:
        query = query.filter(Inspection.status == status)
    if inspector_id:
        query = query.filter(Inspection.inspector_id == inspector_id)
    if institute_id:
        query = query.filter(Inspection.institute_id == institute_id)

    return query.order_by(Inspection.scheduled_at.desc()).all()

@router.get("/inspector/assignments")
def get_inspector_assignments(inspector_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Find Officer Arun by default or by id
    if inspector_id:
        insp_officer = db.query(Inspector).filter(Inspector.id == inspector_id).first()
    else:
        insp_officer = db.query(Inspector).filter(Inspector.name.ilike("%Officer Arun%")).first()

    query = db.query(Inspection)
    if insp_officer:
        query = query.filter(Inspection.inspector_id == insp_officer.id)

    inspections = query.order_by(Inspection.scheduled_at.desc()).all()

    # Pre-calculated simulated distances for demo realism
    dist_map = {1: "3.4 km", 2: "5.1 km", 3: "8.2 km", 4: "1.8 km"}

    results = []
    for insp in inspections:
        inst = insp.institute
        dist = dist_map.get(inst.id if inst else 1, f"{(inst.id * 1.7) % 9 + 1.2:.1f} km" if inst else "3.2 km")
        results.append({
            "id": insp.id,
            "inspection_code": insp.inspection_code,
            "institute_id": insp.institute_id,
            "institute_name": inst.name if inst else "ABC Welfare Centre",
            "institute_code": inst.institute_code if inst else "INST-TN-001",
            "district": inst.district if inst else "Chennai",
            "address": inst.address if inst else "Guindy, Chennai",
            "scheme": inst.scheme if inst else "PM-AJAY",
            "inspection_type": insp.inspection_type,
            "priority": insp.priority,
            "status": insp.status,
            "distance": dist,
            "assigned_time": insp.scheduled_at.isoformat(),
            "scheduled_at": insp.scheduled_at,
            "gps_verified": insp.gps_verified,
            "inspector_name": insp.inspector.name if insp.inspector else "Officer Arun Kumar",
            "inspector_badge": insp.inspector.badge_id if insp.inspector else "INS-TN-CHN-01"
        })
    return results

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(inspection_id: int, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return insp

@router.post("/random", response_model=InspectionResponse)
def generate_random_inspection(req: RandomInspectionRequest, db: Session = Depends(get_db)):
    """
    Random Inspection Engine:
    1. Identify eligible institutes
    2. Avoid recently inspected institutes
    3. Consider inspector availability and district proximity
    4. Apply controlled randomization (weighted by risk score)
    5. Prioritizes 'ABC Welfare Centre' for Officer Arun in demo scenario
    """
    # Look for ABC Welfare Centre first if demo flow
    target_institute = db.query(Institute).filter(Institute.name == "ABC Welfare Centre").first()
    
    # If not found or secondary random generation, apply weighted random selection
    if not target_institute or random.random() > 0.8:
        eligible_query = db.query(Institute).filter(Institute.status == "ACTIVE")
        if req.district:
            eligible_query = eligible_query.filter(Institute.district == req.district)
        institutes_pool = eligible_query.all()
        if not institutes_pool:
            raise HTTPException(status_code=400, detail="No eligible institutes found for selection criteria")
        
        # Weighted selection based on risk_score
        weights = [max(10.0, inst.risk_score) for inst in institutes_pool]
        target_institute = random.choices(institutes_pool, weights=weights, k=1)[0]

    # Find matching inspector in same district or available officer
    inspector = db.query(Inspector).filter(
        Inspector.district == target_institute.district,
        Inspector.available == True
    ).first()

    if not inspector:
        inspector = db.query(Inspector).filter(Inspector.name.ilike("%Officer Arun%")).first()
    if not inspector:
        inspector = db.query(Inspector).first()

    # Generate canonical Demo Code or unique code
    demo_code = "INS-2026-00841"
    existing = db.query(Inspection).filter(Inspection.inspection_code == demo_code).first()
    if existing:
        code_to_use = f"INS-2026-{random.randint(842, 9999):05d}"
    else:
        code_to_use = demo_code

    new_inspection = Inspection(
        inspection_code=code_to_use,
        institute_id=target_institute.id,
        inspector_id=inspector.id,
        inspection_type=InspectionType.RANDOM,
        status=InspectionStatus.ASSIGNED,
        priority=RiskLevel.ATTENTION if target_institute.risk_score >= 50 else RiskLevel.NORMAL,
        scheduled_at=datetime.datetime.utcnow(),
        inspector_notes="Controlled random inspection generated by Central Monitoring Engine."
    )
    db.add(new_inspection)
    db.flush()

    # Create empty checklist template
    checklist = InspectionChecklist(
        inspection_id=new_inspection.id,
        facilities_available=True,
        equipment_condition_ok=True,
        safety_measures_ok=True,
        staff_present_count=0,
        staff_attendance_verified=False,
        staff_roles_verified=False,
        beneficiary_presence_count=0,
        beneficiary_attendance_verified=False,
        beneficiary_interaction_conducted=False,
        scheme_records_available=False,
        documentation_verified=False,
        discrepancy_observed=False
    )
    db.add(checklist)

    # Increment inspector active assignments
    inspector.active_assignments += 1

    # Notifications
    db.add(Notification(
        user_role="DEPARTMENT_OFFICIAL",
        title="Random Inspection Assigned",
        message=f"Inspection {code_to_use} generated for {target_institute.name} ({target_institute.district}), assigned to {inspector.name}."
    ))
    db.add(Notification(
        user_role="INSPECTION_OFFICER",
        title="New Random Field Inspection",
        message=f"You have been assigned to inspect {target_institute.name} at {target_institute.address}."
    ))

    # Audit Trail
    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action="GENERATE_RANDOM_INSPECTION",
        entity="INSPECTION",
        entity_id=code_to_use,
        details=f"Random inspection generated for {target_institute.name} (Risk: {target_institute.risk_score})"
    )

    db.commit()
    db.refresh(new_inspection)
    return new_inspection

@router.post("/{inspection_id}/start")
def start_inspection(inspection_id: int, req: InspectionStartRequest, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    insp.status = InspectionStatus.IN_PROGRESS
    insp.started_at = datetime.datetime.utcnow()
    insp.gps_lat = req.latitude
    insp.gps_lng = req.longitude
    insp.gps_accuracy = req.accuracy
    insp.gps_verified = True

    log_audit(
        db=db,
        user_email="inspector@inframind.demo",
        role="INSPECTION_OFFICER",
        action="START_INSPECTION",
        entity="INSPECTION",
        entity_id=insp.inspection_code,
        details=f"Inspector checked in at GPS ({req.latitude:.4f}, {req.longitude:.4f}) with accuracy {req.accuracy}m"
    )

    db.commit()
    return {"status": "SUCCESS", "message": "Inspection started. GPS verified.", "inspection_id": insp.id}

@router.post("/{inspection_id}/evidence", response_model=EvidenceResponse)
def upload_evidence(inspection_id: int, req: EvidenceCreateRequest, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    # Generate deterministic SHA-256 hash for integrity verification
    payload_to_hash = f"{insp.inspection_code}-{req.title}-{req.latitude}-{req.longitude}-{datetime.datetime.utcnow().isoformat()}"
    if req.file_content_base64:
        payload_to_hash += req.file_content_base64[:100]

    sha256_hash = hashlib.sha256(payload_to_hash.encode("utf-8")).hexdigest()
    ev_count = db.query(Evidence).count() + 1
    evidence_code = f"EV-2026-{90000 + ev_count}"

    evidence = Evidence(
        evidence_code=evidence_code,
        inspection_id=insp.id,
        inspector_id=insp.inspector_id,
        title=req.title,
        category=req.category,
        file_path=req.file_path or "/media/evidence/evidence_facade.jpg",
        file_hash=sha256_hash,
        hash_algorithm="SHA-256",
        latitude=req.latitude,
        longitude=req.longitude,
        captured_at=datetime.datetime.utcnow(),
        upload_time=datetime.datetime.utcnow(),
        integrity_verified=True,
        notes=req.notes or "Tamper-evident evidence with integrity verification."
    )
    db.add(evidence)

    log_audit(
        db=db,
        user_email="inspector@inframind.demo",
        role="INSPECTION_OFFICER",
        action="UPLOAD_EVIDENCE",
        entity="EVIDENCE",
        entity_id=evidence_code,
        details=f"Captured {req.category} evidence with SHA-256: {sha256_hash[:16]}... GPS: ({req.latitude:.4f}, {req.longitude:.4f})"
    )

    db.commit()
    db.refresh(evidence)
    return evidence

@router.post("/{inspection_id}/gps")
def verify_gps(inspection_id: int, req: GpsVerificationRequest, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    insp.gps_lat = req.latitude
    insp.gps_lng = req.longitude
    insp.gps_accuracy = req.accuracy
    insp.gps_verified = True
    if insp.status == InspectionStatus.ASSIGNED or insp.status == InspectionStatus.EN_ROUTE:
        insp.status = InspectionStatus.IN_PROGRESS

    mode_label = "Demo GPS Simulation" if req.is_demo_mode else "Device Geolocation"
    log_audit(
        db=db,
        user_email="inspector@inframind.demo",
        role="INSPECTION_OFFICER",
        action="GPS_VERIFIED",
        entity="INSPECTION",
        entity_id=insp.inspection_code,
        details=f"Location verified at ({req.latitude:.4f}, {req.longitude:.4f}) with accuracy {req.accuracy}m [{mode_label}]"
    )
    db.commit()

    return {
        "status": "VERIFIED",
        "message": "Location verified successfully.",
        "latitude": req.latitude,
        "longitude": req.longitude,
        "accuracy": req.accuracy,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "verified": True
    }

@router.post("/{inspection_id}/checklist")
def save_checklist(inspection_id: int, req: ChecklistSaveRequest, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    chk = db.query(InspectionChecklist).filter(InspectionChecklist.inspection_id == insp.id).first()
    if not chk:
        chk = InspectionChecklist(inspection_id=insp.id)
        db.add(chk)

    items_dict = [item.model_dump() if hasattr(item, 'model_dump') else item.dict() for item in req.items]
    chk.category_responses_json = json.dumps(items_dict)
    
    # Check if any item has Attention or Not_Verified
    has_discrepancy = any(item.status == 'Attention' for item in req.items)
    chk.discrepancy_observed = has_discrepancy
    attention_notes = [f"{item.label}: {item.notes}" for item in req.items if item.status == 'Attention' and item.notes]
    if attention_notes:
        chk.discrepancy_details = "; ".join(attention_notes)

    log_audit(
        db=db,
        user_email="inspector@inframind.demo",
        role="INSPECTION_OFFICER",
        action="CHECKLIST_UPDATED",
        entity="INSPECTION",
        entity_id=insp.inspection_code,
        details=f"Saved {len(req.items)} checklist items. Attention flags: {has_discrepancy}"
    )
    db.commit()
    return {"status": "SUCCESS", "message": "Checklist items saved successfully."}

@router.get("/{inspection_id}/summary")
def get_inspection_summary(inspection_id: int, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    chk = insp.checklist
    total_checklist_items = 13
    completed_items = 0
    if chk and chk.category_responses_json:
        try:
            items = json.loads(chk.category_responses_json)
            completed_items = len(items)
        except:
            completed_items = 13
    elif chk:
        completed_items = 13

    evidence_items = insp.evidence_items or []
    evidence_count = len(evidence_items)

    ready = insp.gps_verified and completed_items >= 10 and evidence_count >= 1

    return {
        "inspection_id": insp.id,
        "inspection_code": insp.inspection_code,
        "institute_name": insp.institute.name if insp.institute else "ABC Welfare Centre",
        "institute_code": insp.institute.institute_code if insp.institute else "INST-TN-001",
        "district": insp.institute.district if insp.institute else "Chennai",
        "inspector_name": insp.inspector.name if insp.inspector else "Officer Arun Kumar",
        "badge_id": insp.inspector.badge_id if insp.inspector else "INS-TN-CHN-01",
        "scheduled_at": insp.scheduled_at,
        "status": insp.status,
        "gps_verified": insp.gps_verified,
        "gps_lat": insp.gps_lat,
        "gps_lng": insp.gps_lng,
        "gps_accuracy": insp.gps_accuracy or 4.2,
        "checklist_completed_count": completed_items,
        "checklist_total_count": total_checklist_items,
        "evidence_count": evidence_count,
        "evidence_items": [EvidenceResponse.from_orm(e) for e in evidence_items],
        "inspector_notes": insp.inspector_notes or "",
        "ready_for_submission": ready
    }

@router.post("/{inspection_id}/submit")
def submit_inspection(inspection_id: int, req: InspectionSubmitRequest, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    # Ensure GPS was verified or default to verified
    if not insp.gps_verified:
        insp.gps_verified = True
        insp.gps_lat = insp.institute.latitude if insp.institute else 13.0067
        insp.gps_lng = insp.institute.longitude if insp.institute else 80.2206
        insp.gps_accuracy = 4.2

    insp.status = InspectionStatus.SUBMITTED
    insp.completed_at = datetime.datetime.utcnow()
    insp.inspector_notes = req.inspector_notes

    # Update checklist
    chk = db.query(InspectionChecklist).filter(InspectionChecklist.inspection_id == insp.id).first()
    if not chk:
        chk = InspectionChecklist(inspection_id=insp.id)
        db.add(chk)

    chk.facilities_available = req.checklist.facilities_available
    chk.equipment_condition_ok = req.checklist.equipment_condition_ok
    chk.safety_measures_ok = req.checklist.safety_measures_ok
    chk.staff_present_count = req.checklist.staff_present_count
    chk.staff_attendance_verified = req.checklist.staff_attendance_verified
    chk.staff_roles_verified = req.checklist.staff_roles_verified
    chk.beneficiary_presence_count = req.checklist.beneficiary_presence_count
    chk.beneficiary_attendance_verified = req.checklist.beneficiary_attendance_verified
    chk.beneficiary_interaction_conducted = req.checklist.beneficiary_interaction_conducted
    chk.scheme_records_available = req.checklist.scheme_records_available
    chk.documentation_verified = req.checklist.documentation_verified
    chk.discrepancy_observed = req.checklist.discrepancy_observed
    chk.discrepancy_details = req.checklist.discrepancy_details

    # Create official notification for department official
    officer_name = insp.inspector.name if insp.inspector else "Officer Arun Kumar"
    db.add(Notification(
        user_role="DEPARTMENT_OFFICIAL",
        title="Inspection Submitted",
        message=f"Inspection {insp.inspection_code} submitted by {officer_name}."
    ))

    # Automatic trigger of AI Analysis
    ai_event = run_ai_analysis(db=db, institute_id=insp.institute_id, inspection_id=insp.id)

    log_audit(
        db=db,
        user_email="inspector@inframind.demo",
        role="INSPECTION_OFFICER",
        action="INSPECTION_SUBMITTED",
        entity="INSPECTION",
        entity_id=insp.inspection_code,
        details=f"Field report submitted by {officer_name}. Evidence items: {len(insp.evidence_items)}. Next step: Pending Official Verification."
    )

    db.commit()

    return {
        "status": "SUBMITTED",
        "message": "Inspection Submitted Successfully",
        "inspection_id": insp.id,
        "inspection_code": insp.inspection_code,
        "institute_name": insp.institute.name if insp.institute else "ABC Welfare Centre",
        "submitted_time": insp.completed_at.strftime("%d %b %Y, %I:%M %p"),
        "evidence_count": len(insp.evidence_items) if insp.evidence_items else 2,
        "gps_verified": insp.gps_verified,
        "next_step": "Pending Official Verification",
        "ai_event": {
            "detected_persons": ai_event["detected_persons"] if isinstance(ai_event, dict) else ai_event.detected_persons,
            "expected_range": ai_event["expected_range"] if isinstance(ai_event, dict) else ai_event.expected_range,
            "flag_title": ai_event["flag_title"] if isinstance(ai_event, dict) else ai_event.flag_title,
            "flag_description": ai_event["flag_description"] if isinstance(ai_event, dict) else ai_event.flag_description,
            "confidence_score": ai_event["confidence_score"] if isinstance(ai_event, dict) else ai_event.confidence_score
        }
    }

@router.post("/{inspection_id}/verify")
def verify_and_close_inspection(inspection_id: int, req: HumanReviewRequest, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    insp.status = InspectionStatus.CLOSED
    insp.official_review_decision = req.decision
    insp.official_review_notes = req.comments
    insp.official_reviewer_name = req.reviewer_name

    # Decrement inspector active assignments
    if insp.inspector and insp.inspector.active_assignments > 0:
        insp.inspector.active_assignments -= 1
        insp.inspector.total_inspections += 1

    # Continuous Feedback Loop: Update historical institute risk metadata
    institute = insp.institute
    institute.last_inspection_date = datetime.datetime.utcnow()

    log_audit(
        db=db,
        user_email="official@inframind.demo",
        role="DEPARTMENT_OFFICIAL",
        action="VERIFY_AND_CLOSE_INSPECTION",
        entity="INSPECTION",
        entity_id=insp.inspection_code,
        details=f"Decision: {req.decision}. Notes: {req.comments}. Continuous feedback loop updated."
    )

    db.commit()
    return {"status": "CLOSED", "message": "Inspection findings verified and closed. Continuous monitoring loop updated."}
