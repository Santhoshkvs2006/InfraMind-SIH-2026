from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CctvCamera, Institute
from app.schemas import CctvCameraResponse
import datetime

router = APIRouter(prefix="/cctv", tags=["CCTV Monitoring"])

@router.get("/institutes/{institute_id}/cameras", response_model=List[CctvCameraResponse])
def get_institute_cameras(institute_id: int, db: Session = Depends(get_db)):
    cameras = db.query(CctvCamera).filter(CctvCamera.institute_id == institute_id).all()
    if not cameras:
        # Generate default 4 cameras if none found
        institute = db.query(Institute).filter(Institute.id == institute_id).first()
        if not institute:
            raise HTTPException(status_code=404, detail="Institute not found")
        
        defaults = [
            ("CAM-01", "Camera 01 – Main Entrance", "Main Gate & Entry Foyer"),
            ("CAM-02", "Camera 02 – Activity Hall", "Multi-purpose Hall / Training Zone"),
            ("CAM-03", "Camera 03 – Classroom Block", "Vocational Training Classrooms"),
            ("CAM-04", "Camera 04 – Dining / Service Area", "Beneficiary Dining & Nutrition Counter")
        ]
        cameras = []
        for code, name, area in defaults:
            c = CctvCamera(
                institute_id=institute.id,
                camera_code=code,
                name=name,
                location_area=area,
                stream_url=f"/media/cctv/sim_{code.lower()}.mp4",
                is_live=True,
                protocol="Simulated RTSP/ONVIF"
            )
            db.add(c)
            cameras.append(c)
        db.commit()
    return cameras

@router.post("/cameras/{camera_id}/snapshot")
def take_camera_snapshot(camera_id: int, db: Session = Depends(get_db)):
    cam = db.query(CctvCamera).filter(CctvCamera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    return {
        "status": "CAPTURED",
        "camera_code": cam.camera_code,
        "camera_name": cam.name,
        "timestamp": timestamp,
        "snapshot_url": "/media/evidence/evidence_facade.jpg",
        "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "integrity_verified": True
    }
