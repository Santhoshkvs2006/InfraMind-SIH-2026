import hashlib
import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models import (
    User, UserRole, Institute, Inspector, Inspection, InspectionChecklist,
    Evidence, AttendanceRecord, Alert, CctvCamera, AuditLog, Notification,
    RiskLevel, InspectionStatus, InspectionType, AlertSeverity, AlertStatus
)

def hash_pw(password: str) -> str:
    return hashlib.sha256(f"inframind-salt-{password}".encode("utf-8")).hexdigest()

def generate_sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def seed_database(db: Session, force: bool = False):
    if not force and db.query(User).first():
        print("Database already seeded. Skipping.")
        return

    # Clear existing tables if force
    if force:
        db.query(AuditLog).delete()
        db.query(Notification).delete()
        db.query(Alert).delete()
        db.query(Evidence).delete()
        db.query(InspectionChecklist).delete()
        db.query(Inspection).delete()
        db.query(AttendanceRecord).delete()
        db.query(CctvCamera).delete()
        db.query(Inspector).delete()
        db.query(Institute).delete()
        db.query(User).delete()
        db.commit()

    print("Seeding InfraMind database with realistic DoSJE data...")

    # 1. USERS
    demo_password_hash = hash_pw("demo123")
    users = [
        User(
            email="official@inframind.demo",
            name="Dr. Rajeshwari Sharma, IAS",
            role=UserRole.DEPARTMENT_OFFICIAL,
            hashed_password=demo_password_hash,
            department="DoSJE Monitoring & Vigilance Wing"
        ),
        User(
            email="inspector@inframind.demo",
            name="Officer Arun Kumar",
            role=UserRole.INSPECTION_OFFICER,
            hashed_password=demo_password_hash,
            department="District Inspection Cell – Chennai"
        ),
        User(
            email="institute@inframind.demo",
            name="ABC Welfare Centre Admin",
            role=UserRole.INSTITUTE_NGO,
            hashed_password=demo_password_hash,
            department="ABC Welfare Centre, Chennai"
        ),
        User(
            email="admin@inframind.demo",
            name="Central Platform Administrator",
            role=UserRole.SUPER_ADMIN,
            hashed_password=demo_password_hash,
            department="Ministry of Social Justice & Empowerment, GoI"
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. INSTITUTES (16 realistic institutes)
    institutes_data = [
        {
            "code": "INST-TN-001",
            "name": "ABC Welfare Centre",
            "state": "Tamil Nadu",
            "district": "Chennai",
            "address": "42 Anna Salai, Guindy, Chennai 600032",
            "scheme": "PM-AJAY (Adarsh Gram & Skill)",
            "contact_person": "K. Ramanathan",
            "phone": "+91 94441 23456",
            "email": "contact@abcwelfare.org",
            "lat": 13.0067,
            "lng": 80.2206,
            "beneficiaries": 120,
            "staff": 14,
            "attendance": 64.2,
            "risk_score": 52.0,  # Prior to demo inspection jump to 78
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 74.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-002",
            "name": "XYZ Social Development Centre",
            "state": "Tamil Nadu",
            "district": "Coimbatore",
            "address": "18 Avinashi Road, Peelamedu, Coimbatore 641004",
            "scheme": "SMILE (Livelihood & Rehabilitation)",
            "contact_person": "S. Meenakshi",
            "phone": "+91 98421 65432",
            "email": "meenakshi@xyzdevelopment.org",
            "lat": 11.0168,
            "lng": 76.9558,
            "beneficiaries": 85,
            "staff": 10,
            "attendance": 96.4,
            "risk_score": 36.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 88.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-003",
            "name": "PQR Skill & Rehabilitation Institute",
            "state": "Tamil Nadu",
            "district": "Madurai",
            "address": "77 Alagar Kovil Main Road, Madurai 625002",
            "scheme": "PM-DAKSH (Skill Development)",
            "contact_person": "M. Sundaram",
            "phone": "+91 97890 11223",
            "email": "director@pqrskill.in",
            "lat": 9.9252,
            "lng": 78.1198,
            "beneficiaries": 150,
            "staff": 18,
            "attendance": 48.0,
            "risk_score": 91.0,
            "risk_level": RiskLevel.VERIFICATION_REQUIRED,
            "trust_score": 42.0,
            "cctv_status": "DEGRADED"
        },
        {
            "code": "INST-TN-004",
            "name": "Vayoshreshtha Senior Care Haven",
            "state": "Tamil Nadu",
            "district": "Salem",
            "address": "12 Cherry Road, Hasthampatti, Salem 636007",
            "scheme": "Senior Citizens Care (Vayoshreshtha)",
            "contact_person": "Dr. V. Anand",
            "phone": "+91 94432 99881",
            "email": "anand@vayosenior.org",
            "lat": 11.6643,
            "lng": 78.1460,
            "beneficiaries": 60,
            "staff": 12,
            "attendance": 98.0,
            "risk_score": 18.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 94.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-005",
            "name": "Nasha Mukt Rehabilitation Kendra",
            "state": "Tamil Nadu",
            "district": "Tiruchirappalli",
            "address": "9 Cantonment Road, Trichy 620001",
            "scheme": "Nasha Mukt Bharat Abhiyaan (NMBA)",
            "contact_person": "R. Selvaraj",
            "phone": "+91 98430 44556",
            "email": "admin@trichy-nmba.org",
            "lat": 10.7905,
            "lng": 78.7047,
            "beneficiaries": 45,
            "staff": 8,
            "attendance": 88.5,
            "risk_score": 44.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 81.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-006",
            "name": "Divyangjan Assistive Aids Centre",
            "state": "Tamil Nadu",
            "district": "Tirunelveli",
            "address": "33 High Ground Road, Palayamkottai, Tirunelveli 627002",
            "scheme": "ADIP Scheme for Divyangjan",
            "contact_person": "T. Kalaiarasi",
            "phone": "+91 94862 33445",
            "email": "kalai@divyangcare.org",
            "lat": 8.7139,
            "lng": 77.7567,
            "beneficiaries": 90,
            "staff": 11,
            "attendance": 76.0,
            "risk_score": 68.0,
            "risk_level": RiskLevel.ATTENTION,
            "trust_score": 69.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-007",
            "name": "Kaveri Delta Community Empowerment Trust",
            "state": "Tamil Nadu",
            "district": "Thanjavur",
            "address": "5 Gandhiji Road, Thanjavur 613001",
            "scheme": "PM-AJAY (Income Generation)",
            "contact_person": "N. Balakrishnan",
            "phone": "+91 98424 77889",
            "email": "bala@kaveritrust.org",
            "lat": 10.7870,
            "lng": 79.1378,
            "beneficiaries": 110,
            "staff": 13,
            "attendance": 92.1,
            "risk_score": 28.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 90.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-008",
            "name": "Kongu Livelihood Training Academy",
            "state": "Tamil Nadu",
            "district": "Erode",
            "address": "24 Brough Road, Erode 638001",
            "scheme": "PM-DAKSH (Skill Development)",
            "contact_person": "C. Murugesan",
            "phone": "+91 94437 66554",
            "email": "info@kongulivelihood.org",
            "lat": 11.3410,
            "lng": 77.7172,
            "beneficiaries": 75,
            "staff": 9,
            "attendance": 70.4,
            "risk_score": 62.0,
            "risk_level": RiskLevel.ATTENTION,
            "trust_score": 72.0,
            "cctv_status": "DEGRADED"
        },
        {
            "code": "INST-TN-009",
            "name": "Pearl City Skill Vocational Institute",
            "state": "Tamil Nadu",
            "district": "Thoothukudi",
            "address": "88 Beach Road, Tuticorin 628001",
            "scheme": "PM-AJAY (Hostel & Education)",
            "contact_person": "G. Anthony",
            "phone": "+91 98432 11009",
            "email": "anthony@pearlcityngo.in",
            "lat": 8.7642,
            "lng": 78.1348,
            "beneficiaries": 95,
            "staff": 12,
            "attendance": 55.0,
            "risk_score": 84.0,
            "risk_level": RiskLevel.VERIFICATION_REQUIRED,
            "trust_score": 49.0,
            "cctv_status": "OFFLINE"
        },
        {
            "code": "INST-TN-010",
            "name": "Vellore Inclusive Living Society",
            "state": "Tamil Nadu",
            "district": "Vellore",
            "address": "15 Officer's Line, Vellore 632001",
            "scheme": "SMILE (Comprehensive Support)",
            "contact_person": "S. Premkumar",
            "phone": "+91 94433 22110",
            "email": "prem@velloreinclusive.org",
            "lat": 12.9165,
            "lng": 79.1325,
            "beneficiaries": 80,
            "staff": 10,
            "attendance": 94.0,
            "risk_score": 22.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 92.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-KA-011",
            "name": "Bengaluru Urban Youth Vocational Trust",
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "address": "104 MG Road, Bengaluru 560001",
            "scheme": "PM-DAKSH (Skill Development)",
            "contact_person": "H. Ramesh",
            "phone": "+91 98800 12345",
            "email": "ramesh@youthtrust.org",
            "lat": 12.9716,
            "lng": 77.5946,
            "beneficiaries": 140,
            "staff": 16,
            "attendance": 89.2,
            "risk_score": 38.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 86.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-MH-012",
            "name": "Mumbai Rehabilitation & Resettlement Mission",
            "state": "Maharashtra",
            "district": "Mumbai Suburban",
            "address": "52 Kurla Andheri Road, Sakinaka, Mumbai 400072",
            "scheme": "SMILE (Livelihood & Shelter)",
            "contact_person": "P. Deshmukh",
            "phone": "+91 98200 45678",
            "email": "deshmukh@mumbaimission.org",
            "lat": 19.0760,
            "lng": 72.8777,
            "beneficiaries": 160,
            "staff": 20,
            "attendance": 61.5,
            "risk_score": 87.0,
            "risk_level": RiskLevel.VERIFICATION_REQUIRED,
            "trust_score": 51.0,
            "cctv_status": "DEGRADED"
        },
        {
            "code": "INST-TN-013",
            "name": "Kanchipuram Heritage Artisan Guild",
            "state": "Tamil Nadu",
            "district": "Kanchipuram",
            "address": "19 Gandhi Road, Kanchipuram 631501",
            "scheme": "PM-AJAY (Traditional Crafts & Skill)",
            "contact_person": "V. Parthiban",
            "phone": "+91 94444 88776",
            "email": "parthi@kanchiguild.org",
            "lat": 12.8342,
            "lng": 79.7036,
            "beneficiaries": 65,
            "staff": 7,
            "attendance": 91.0,
            "risk_score": 31.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 89.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-014",
            "name": "Dindigul Rural Empowerment Centre",
            "state": "Tamil Nadu",
            "district": "Dindigul",
            "address": "40 Main Road, Dindigul 624001",
            "scheme": "Senior Citizens Care (Vayoshreshtha)",
            "contact_person": "M. Alagappan",
            "phone": "+91 98428 33441",
            "email": "alagu@dindigulrural.org",
            "lat": 10.3673,
            "lng": 77.9803,
            "beneficiaries": 50,
            "staff": 6,
            "attendance": 95.0,
            "risk_score": 19.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 93.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-015",
            "name": "Cuddalore Coastal Welfare Foundation",
            "state": "Tamil Nadu",
            "district": "Cuddalore",
            "address": "8 Beach Road, Cuddalore 607001",
            "scheme": "ADIP Scheme for Divyangjan",
            "contact_person": "J. Franklin",
            "phone": "+91 94431 55667",
            "email": "franklin@cuddalorewelfare.org",
            "lat": 11.7480,
            "lng": 79.7714,
            "beneficiaries": 80,
            "staff": 9,
            "attendance": 82.0,
            "risk_score": 58.0,
            "risk_level": RiskLevel.ATTENTION,
            "trust_score": 75.0,
            "cctv_status": "ONLINE"
        },
        {
            "code": "INST-TN-016",
            "name": "Thiruvallur Social Action Society",
            "state": "Tamil Nadu",
            "district": "Thiruvallur",
            "address": "22 JN Road, Thiruvallur 602001",
            "scheme": "Nasha Mukt Bharat Abhiyaan (NMBA)",
            "contact_person": "K. Govindaraj",
            "phone": "+91 98410 99887",
            "email": "govind@thiruvallur-action.org",
            "lat": 13.1432,
            "lng": 79.9083,
            "beneficiaries": 70,
            "staff": 8,
            "attendance": 87.0,
            "risk_score": 41.0,
            "risk_level": RiskLevel.NORMAL,
            "trust_score": 83.0,
            "cctv_status": "ONLINE"
        }
    ]

    inst_objects = []
    for item in institutes_data:
        inst = Institute(
            institute_code=item["code"],
            name=item["name"],
            state=item["state"],
            district=item["district"],
            address=item["address"],
            scheme=item["scheme"],
            contact_person=item["contact_person"],
            contact_phone=item["phone"],
            contact_email=item["email"],
            latitude=item["lat"],
            longitude=item["lng"],
            beneficiaries_registered=item["beneficiaries"],
            staff_count=item["staff"],
            attendance_rate=item["attendance"],
            risk_score=item["risk_score"],
            risk_level=item["risk_level"],
            trust_score=item["trust_score"],
            cctv_status=item["cctv_status"],
            cctv_cameras_count=4,
            last_inspection_date=datetime.datetime.utcnow() - datetime.timedelta(days=45),
            last_vc_date=datetime.datetime.utcnow() - datetime.timedelta(days=12),
            status="ACTIVE"
        )
        inst_objects.append(inst)

    db.add_all(inst_objects)
    db.commit()

    # Link demo NGO user to ABC Welfare Centre
    abc_inst = db.query(Institute).filter(Institute.institute_code == "INST-TN-001").first()
    ngo_user = db.query(User).filter(User.email == "institute@inframind.demo").first()
    if abc_inst and ngo_user:
        ngo_user.institute_id = abc_inst.id
        db.commit()

    # 3. INSPECTORS (10 officers)
    inspectors_data = [
        {"name": "Officer Arun Kumar", "badge": "INS-TN-CHN-01", "district": "Chennai", "phone": "+91 94440 00101", "lat": 13.0827, "lng": 80.2707},
        {"name": "Officer Priya Sundaram", "badge": "INS-TN-CBE-02", "district": "Coimbatore", "phone": "+91 94440 00102", "lat": 11.0168, "lng": 76.9558},
        {"name": "Officer Rajesh Kannan", "badge": "INS-TN-MDU-03", "district": "Madurai", "phone": "+91 94440 00103", "lat": 9.9252, "lng": 78.1198},
        {"name": "Officer Meenakshi Nathan", "badge": "INS-TN-SLM-04", "district": "Salem", "phone": "+91 94440 00104", "lat": 11.6643, "lng": 78.1460},
        {"name": "Officer Karthik Raja", "badge": "INS-TN-TRY-05", "district": "Tiruchirappalli", "phone": "+91 94440 00105", "lat": 10.7905, "lng": 78.7047},
        {"name": "Officer Deepa Krishnan", "badge": "INS-TN-TNV-06", "district": "Tirunelveli", "phone": "+91 94440 00106", "lat": 8.7139, "lng": 77.7567},
        {"name": "Officer Saravanan Mani", "badge": "INS-TN-TNJ-07", "district": "Thanjavur", "phone": "+91 94440 00107", "lat": 10.7870, "lng": 79.1378},
        {"name": "Officer Anitha Venkatesh", "badge": "INS-TN-ERD-08", "district": "Erode", "phone": "+91 94440 00108", "lat": 11.3410, "lng": 77.7172},
        {"name": "Officer Vignesh Balaji", "badge": "INS-TN-VLR-09", "district": "Vellore", "phone": "+91 94440 00109", "lat": 12.9165, "lng": 79.1325},
        {"name": "Officer Divya Murthy", "badge": "INS-TN-KNC-10", "district": "Kanchipuram", "phone": "+91 94440 00110", "lat": 12.8342, "lng": 79.7036}
    ]

    inspector_objs = []
    for idx, insp in enumerate(inspectors_data):
        inspector = Inspector(
            name=insp["name"],
            badge_id=insp["badge"],
            district=insp["district"],
            phone=insp["phone"],
            active_assignments=1 if idx == 0 else 0,
            total_inspections=14 + idx * 3,
            available=True,
            current_lat=insp["lat"],
            current_lng=insp["lng"]
        )
        inspector_objs.append(inspector)

    db.add_all(inspector_objs)
    db.commit()

    # Link demo inspector user to Officer Arun
    arun_inspector = db.query(Inspector).filter(Inspector.badge_id == "INS-TN-CHN-01").first()
    insp_user = db.query(User).filter(User.email == "inspector@inframind.demo").first()
    if arun_inspector and insp_user:
        arun_inspector.user_id = insp_user.id
        db.commit()

    # 4. CCTV CAMERAS (4 per institute for top institutes)
    for inst in inst_objects[:6]:
        cam_specs = [
            ("CAM-01", "Camera 01 – Main Entrance", "Main Gate & Entry Foyer", "stream_entrance_sim.mp4"),
            ("CAM-02", "Camera 02 – Activity Hall", "Multi-purpose Hall / Training Zone", "stream_hall_sim.mp4"),
            ("CAM-03", "Camera 03 – Classroom Block", "Vocational Training Classrooms", "stream_class_sim.mp4"),
            ("CAM-04", "Camera 04 – Dining / Service Area", "Beneficiary Dining & Nutrition Counter", "stream_dining_sim.mp4")
        ]
        for ccode, cname, cloc, cstream in cam_specs:
            cam = CctvCamera(
                institute_id=inst.id,
                camera_code=ccode,
                name=cname,
                location_area=cloc,
                stream_url=f"/media/cctv/{cstream}",
                is_live=True if inst.cctv_status != "OFFLINE" else False,
                protocol="Simulated RTSP/ONVIF"
            )
            db.add(cam)
    db.commit()

    # 5. ATTENDANCE RECORDS (100+ records across past 30 days)
    for inst in inst_objects[:8]:
        base_exp = inst.beneficiaries_registered
        for day_offset in range(15):
            date_str = (datetime.date.today() - datetime.timedelta(days=day_offset)).isoformat()
            if inst.name == "PQR Skill & Rehabilitation Institute":
                rep = int(base_exp * 0.90)
                obs = int(base_exp * 0.45)
                anom = True
            elif inst.name == "ABC Welfare Centre" and day_offset < 3:
                rep = 95
                obs = 61
                anom = True
            else:
                rep = int(base_exp * (0.92 + (day_offset % 5) * 0.015))
                obs = int(rep * 0.98)
                anom = False
            
            att = AttendanceRecord(
                institute_id=inst.id,
                record_date=date_str,
                expected_count=base_exp,
                reported_count=rep,
                observed_count=obs,
                variance_percentage=round(abs(rep - obs) / rep * 100, 1) if rep else 0.0,
                anomaly_detected=anom,
                confidence=0.87 if anom else 0.95
            )
            db.add(att)
    db.commit()

    # 6. HISTORICAL INSPECTIONS (30+ inspections)
    inspections_list = []
    for i in range(1, 32):
        target_inst = inst_objects[i % len(inst_objects)]
        assigned_insp = inspector_objs[i % len(inspector_objs)]
        code = f"INS-2026-{10000 + i}"
        status = InspectionStatus.CLOSED if i > 5 else (InspectionStatus.ASSIGNED if i == 1 else InspectionStatus.IN_PROGRESS)
        
        insp_rec = Inspection(
            inspection_code=code,
            institute_id=target_inst.id,
            inspector_id=assigned_insp.id,
            inspection_type=InspectionType.RANDOM if i % 2 == 0 else InspectionType.ROUTINE,
            status=status,
            priority=RiskLevel.ATTENTION if target_inst.risk_score > 50 else RiskLevel.NORMAL,
            scheduled_at=datetime.datetime.utcnow() - datetime.timedelta(days=i),
            started_at=datetime.datetime.utcnow() - datetime.timedelta(days=i, hours=2) if status != InspectionStatus.ASSIGNED else None,
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=i, hours=1) if status == InspectionStatus.CLOSED else None,
            gps_lat=target_inst.latitude + 0.0002,
            gps_lng=target_inst.longitude + 0.0001,
            gps_accuracy=4.2,
            gps_verified=True if status != InspectionStatus.ASSIGNED else False,
            inspector_notes=f"Field verification conducted for {target_inst.name}. Facilities verified in accordance with DoSJE scheme norms."
        )
        db.add(insp_rec)
        db.flush()

        # Add checklist for completed or in-progress
        chk = InspectionChecklist(
            inspection_id=insp_rec.id,
            facilities_available=True,
            equipment_condition_ok=True,
            safety_measures_ok=True,
            staff_present_count=target_inst.staff_count,
            staff_attendance_verified=True,
            staff_roles_verified=True,
            beneficiary_presence_count=int(target_inst.beneficiaries_registered * 0.9),
            beneficiary_attendance_verified=True,
            beneficiary_interaction_conducted=True,
            scheme_records_available=True,
            documentation_verified=True,
            discrepancy_observed=False
        )
        db.add(chk)
        inspections_list.append(insp_rec)
    db.commit()

    # 7. EVIDENCE ITEMS (50+ items with SHA-256 integrity hashes)
    evidence_types = [
        ("Front Elevation & Scheme Board", "Photo", "evidence_facade.jpg"),
        ("Classroom Vocational Session", "Photo", "evidence_class.jpg"),
        ("Biometric Attendance Ledger Scan", "Document", "attendance_register_scan.pdf"),
        ("360 Degree Safety Walkthrough", "Video", "walkthrough_clip.mp4"),
        ("Assistive Aids Distribution Log", "Photo", "aids_log.jpg")
    ]
    
    evidence_count = 0
    for insp_rec in inspections_list[:12]:
        for etitle, ecat, efile in evidence_types:
            evidence_count += 1
            raw_signature = f"{insp_rec.inspection_code}-{etitle}-{evidence_count}-{datetime.datetime.utcnow().isoformat()}"
            sha256_hash = generate_sha256(raw_signature)
            ev = Evidence(
                evidence_code=f"EV-2026-{90000 + evidence_count}",
                inspection_id=insp_rec.id,
                inspector_id=insp_rec.inspector_id,
                title=f"{etitle} ({insp_rec.institute.name})",
                category=ecat,
                file_path=f"/media/evidence/{efile}",
                file_hash=sha256_hash,
                hash_algorithm="SHA-256",
                latitude=insp_rec.institute.latitude + 0.0001,
                longitude=insp_rec.institute.longitude + 0.0001,
                captured_at=datetime.datetime.utcnow() - datetime.timedelta(days=2, hours=evidence_count % 8),
                upload_time=datetime.datetime.utcnow() - datetime.timedelta(days=2, hours=evidence_count % 8),
                integrity_verified=True,
                notes=f"Tamper-evident evidence with integrity verification. Verified on mobile client with GPS."
            )
            db.add(ev)
    db.commit()

    # 8. ALERTS (12 alerts as requested)
    alerts_data = [
        (abc_inst.id, "⚠ Attendance Inconsistency Flagged", "AI detected 17 persons in activity hall vs reported 95 (expected batch 25–40).", AlertSeverity.HIGH, AlertStatus.PENDING_REVIEW),
        (inst_objects[2].id, "⚠ Critical Occupancy Deficit", "Consistent 48% attendance deviation observed over past 10 sessions.", AlertSeverity.HIGH, AlertStatus.PENDING_REVIEW),
        (inst_objects[8].id, "⚠ CCTV Feed Offline", "Camera 01 and Camera 02 telemetry heartbeat lost for > 6 hours.", AlertSeverity.HIGH, AlertStatus.PENDING_REVIEW),
        (inst_objects[5].id, "⚠ Delayed Biometric Submission", "Monthly biometric attendance roll overdue by 5 working days.", AlertSeverity.MEDIUM, AlertStatus.PENDING_REVIEW),
        (inst_objects[7].id, "⚠ Camera 03 Frame Degraded", "Classroom CCTV stream bitrate dropped below operational threshold.", AlertSeverity.LOW, AlertStatus.PENDING_REVIEW),
        (inst_objects[11].id, "⚠ Scheme Enrollment Variance", "Reported beneficiary list shows mismatch with Aadhaar DBT logs.", AlertSeverity.HIGH, AlertStatus.PENDING_REVIEW),
        (inst_objects[1].id, "ℹ Routine Random VC Scheduled", "5-minute random video call verification initiated by Directorate.", AlertSeverity.LOW, AlertStatus.RESOLVED),
        (inst_objects[3].id, "ℹ Evidence Integrity Re-verified", "Periodic hash audit confirmed all 8 evidence artifacts intact.", AlertSeverity.LOW, AlertStatus.RESOLVED),
        (inst_objects[4].id, "⚠ Staff Attendance Mismatch", "2 senior trainers absent without leave notification during shift.", AlertSeverity.MEDIUM, AlertStatus.PENDING_REVIEW),
        (inst_objects[9].id, "ℹ Quarterly Compliance Cleared", "All observations successfully addressed and verified by officer.", AlertSeverity.LOW, AlertStatus.RESOLVED),
        (inst_objects[14].id, "⚠ Equipment Ledger Discrepancy", "3 assistive kits listed in stock not available in storage.", AlertSeverity.MEDIUM, AlertStatus.PENDING_REVIEW),
        (inst_objects[15].id, "ℹ Geofence Location Validated", "Field inspector checked in within 5m radius of designated coordinates.", AlertSeverity.LOW, AlertStatus.RESOLVED)
    ]

    for ainst_id, atitle, areason, asev, astat in alerts_data:
        al = Alert(
            institute_id=ainst_id,
            title=atitle,
            reason=areason,
            severity=asev,
            status=astat,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=np.random.randint(1, 48) if 'np' in globals() else 6)
        )
        db.add(al)
    db.commit()

    # 9. AUDIT LOGS
    audit_samples = [
        ("official@inframind.demo", "DEPARTMENT_OFFICIAL", "SYSTEM_LOGIN", "AUTH", None, "10.42.0.12 (Command Portal)", "SUCCESS", "Official logged into central monitoring console"),
        ("official@inframind.demo", "DEPARTMENT_OFFICIAL", "GENERATE_RANDOM_INSPECTION", "INSPECTION", "INS-2026-00841", "10.42.0.12 (Command Portal)", "SUCCESS", "Triggered weighted random inspection for ABC Welfare Centre"),
        ("inspector@inframind.demo", "INSPECTION_OFFICER", "START_INSPECTION", "INSPECTION", "INS-2026-00841", "172.16.8.44 (Mobile Client)", "SUCCESS", "Officer Arun verified GPS location at Guindy, Chennai"),
        ("inspector@inframind.demo", "INSPECTION_OFFICER", "UPLOAD_EVIDENCE", "EVIDENCE", "EV-2026-09281", "172.16.8.44 (Mobile Client)", "SUCCESS", "Photo evidence captured with SHA-256 hash verified"),
        ("system.ai@inframind.gov.in", "AI_ENGINE", "ANOMALY_DETECTED", "INSTITUTE", "1", "InfraMind AI Core v2.4", "ALERT_GENERATED", "Occupancy disparity detected (17 vs expected 25-40). Confidence 87%"),
        ("official@inframind.demo", "DEPARTMENT_OFFICIAL", "HUMAN_VERIFICATION_REVIEW", "ALERT", "1", "10.42.0.12 (Command Portal)", "SUCCESS", "Official confirmed anomaly observation and ordered random VC verification"),
        ("official@inframind.demo", "DEPARTMENT_OFFICIAL", "CLOSE_INSPECTION", "INSPECTION", "INS-2026-00839", "10.42.0.12 (Command Portal)", "SUCCESS", "Inspection report verified and closed with historical weight update")
    ]
    for uemail, urole, uact, uent, ueid, udev, ures, udet in audit_samples:
        log_entry = AuditLog(
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=30),
            user_email=uemail,
            role=urole,
            action=uact,
            entity=uent,
            entity_id=ueid,
            ip_device=udev,
            result=ures,
            details=udet
        )
        db.add(log_entry)
    db.commit()

    # 10. NOTIFICATIONS
    notifications = [
        Notification(user_role="DEPARTMENT_OFFICIAL", title="Random Inspection Generated", message="ABC Welfare Centre assigned to Officer Arun Kumar (INS-2026-00841)."),
        Notification(user_role="INSPECTION_OFFICER", title="New Field Assignment", message="You have been assigned random inspection INS-2026-00841 in Guindy, Chennai."),
        Notification(user_role="DEPARTMENT_OFFICIAL", title="AI Anomaly Flagged", message="Occupancy anomaly (17 persons detected vs 25-40 expected) requires human verification."),
        Notification(user_role="INSTITUTE_NGO", title="Inspection Notice", message="Notice: A field inspection has been scheduled under PM-AJAY monitoring.")
    ]
    db.add_all(notifications)
    db.commit()

    print("Seed data successfully populated!")
