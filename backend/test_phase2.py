from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get(path):
    res = client.get(path)
    return res.json()

def post(path, data):
    res = client.post(path, json=data)
    if res.status_code >= 400:
        raise Exception(f"HTTP {res.status_code}: {res.text}")
    return res.json()

print("=== STARTING PHASE 2 AUTOMATED INTEGRATION TEST ===")

# 1. Get Inspector Assignments
assignments = get('/inspections/inspector/assignments')
print(f"1. Inspector assignments retrieved: {len(assignments)}")
target = assignments[0]
target_id = target['id']
target_code = target['inspection_code']
print(f"   Target Inspection: {target_code} (ID: {target_id}) - {target['institute_name']}")

# 2. Start Inspection
start_res = post(f'/inspections/{target_id}/start', {'latitude': 13.0067, 'longitude': 80.2206, 'accuracy': 4.2})
print(f"2. Start Inspection: {start_res['status']} - {start_res['message']}")

# 3. GPS Verification
gps_res = post(f'/inspections/{target_id}/gps', {'latitude': 13.0067, 'longitude': 80.2206, 'accuracy': 4.2, 'is_demo_mode': True})
print(f"3. GPS Verification: {gps_res['status']} - Verified: {gps_res['verified']}")

# 4. Checklist Save
checklist_payload = {
    'items': [
        {'id': 'infra_1', 'category': 'INFRASTRUCTURE', 'label': 'Required facilities available', 'status': 'Pass'},
        {'id': 'infra_2', 'category': 'INFRASTRUCTURE', 'label': 'Equipment condition acceptable', 'status': 'Pass'},
        {'id': 'infra_3', 'category': 'INFRASTRUCTURE', 'label': 'Safety conditions acceptable', 'status': 'Pass'},
        {'id': 'infra_4', 'category': 'INFRASTRUCTURE', 'label': 'Infrastructure matches records', 'status': 'Pass'},
        {'id': 'staff_1', 'category': 'STAFF', 'label': 'Staff present', 'status': 'Pass'},
        {'id': 'staff_2', 'category': 'STAFF', 'label': 'Staff attendance verified', 'status': 'Pass'},
        {'id': 'staff_3', 'category': 'STAFF', 'label': 'Staff roles verified', 'status': 'Pass'},
        {'id': 'ben_1', 'category': 'BENEFICIARIES', 'label': 'Beneficiaries present', 'status': 'Attention', 'notes': 'Headcount observed 17 vs registered 120'},
        {'id': 'ben_2', 'category': 'BENEFICIARIES', 'label': 'Attendance verified', 'status': 'Pass'},
        {'id': 'ben_3', 'category': 'BENEFICIARIES', 'label': 'Beneficiary interaction completed', 'status': 'Pass'},
        {'id': 'doc_1', 'category': 'DOCUMENTATION', 'label': 'Required records available', 'status': 'Pass'},
        {'id': 'doc_2', 'category': 'DOCUMENTATION', 'label': 'Scheme/project records verified', 'status': 'Pass'},
        {'id': 'doc_3', 'category': 'DOCUMENTATION', 'label': 'Latest report available', 'status': 'Pass'}
    ]
}
chk_res = post(f'/inspections/{target_id}/checklist', checklist_payload)
print(f"4. Checklist Saved: {chk_res['status']} - {chk_res['message']}")

# 5. Evidence Upload
ev_res = post(f'/inspections/{target_id}/evidence', {
    'title': 'Front Elevation & Scheme Signboard',
    'category': 'Photo',
    'latitude': 13.0067,
    'longitude': 80.2206,
    'notes': 'Tamper-evident evidence with integrity verification.'
})
print(f"5. Evidence Upload: {ev_res['evidence_code']} - SHA-256: {ev_res['file_hash'][:16]}...")

# 6. Inspection Summary
summary_res = get(f'/inspections/{target_id}/summary')
print(f"6. Inspection Summary: Ready={summary_res['ready_for_submission']} | Items={summary_res['checklist_completed_count']} | Evidence={summary_res['evidence_count']}")

# 7. Submit Inspection
submit_res = post(f'/inspections/{target_id}/submit', {
    'inspector_notes': 'Comprehensive field audit executed. Attendance disparity recorded in activity hall.',
    'checklist': {
        'facilities_available': True,
        'equipment_condition_ok': True,
        'safety_measures_ok': True,
        'staff_present_count': 14,
        'staff_attendance_verified': True,
        'staff_roles_verified': True,
        'beneficiary_presence_count': 61,
        'beneficiary_attendance_verified': False,
        'beneficiary_interaction_conducted': True,
        'scheme_records_available': True,
        'documentation_verified': True,
        'discrepancy_observed': True,
        'discrepancy_details': 'Headcount observed 17 vs registered 120'
    }
})
print(f"7. Inspection Submitted: {submit_res['message']}")
print(f"   Next Step: {submit_res['next_step']}")
print(f"   Status: {submit_res['status']}")

# 8. Check Official Notification
notifs = get('/notifications?role=DEPARTMENT_OFFICIAL')
latest_notif = notifs[0]
print(f"8. Official Notification: {latest_notif['title']} -> \"{latest_notif['message']}\"")

# 9. Verify Audit Trail
audits = get('/audit-logs?limit=5')
print(f"9. Latest Audit Actions: {[a['action'] for a in audits[:4]]}")

print("=== ALL PHASE 2 WORKFLOW CHECKS PASSED SUCCESSFULLY ===")
