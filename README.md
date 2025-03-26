# MedicalClinicDB

## Project Description
**MiniWorld Description**: The database is designed to support a healthcare provider company with multiple offices across different states. The company employs general practice doctors and specialists who provide healthcare services to patients. The database will manage information on patients, doctors, appointments, medical records, medical offices, prescriptions, referral approvals, medical tests, and billing. Our program will ensure efficient coordination among various locations.

Doctors specialize in different medical fields and can work in one or more office locations. A patient is assigned to a primary physician who will provide general care. If specialized treatment is needed, the primary physician will refer the patient to a specialist within their network. 

Patients can schedule or cancel appointments with their primary care physician/specialist, get prescriptions, go through medical tests, and have a medical record that gets updated after every appointment. Appointments are scheduled by a patient either via phone or web portal. Each appointment belongs to a single patient and a single doctor, taking place at a specific medical clinic. The system will ensure the patient is sent an email reminder for future appointments. Patients will have the ability to cancel or reschedule their appointments depending on their needs.

At an appointment, the doctor can view a patient’s information, update medical records, create prescriptions, and request medical tests. A patient’s medical record can be updated with diagnoses, prescribed treatments, or referrals for more tests as needed. The system also tracks medical records, prescriptions, and billing to ensure financial processing. 

## Hosting Locally
**Clone the Repo**
```bash
git clone https://github.com/wendy-160/MedicalClinicDB.git
cd 3380-project
```
**Starting backend**
```bash
# make sure you are in the backend
npm init -y #install dependencies
node server.js #start server
```
**Starting the frontend**
```
# make sure you are in the fronent
npm install
npm run dev #start client
```
The app should now be running

** users **
- Admin:
    -email: admin@example.com
    -password: Admin123
- Doctor:
    -email: doctor@example.com
    -password: Doctor123
- Patient:
    -email: john.doe@example.com
    -password: John123
## Project Requirements

### 5 Must Haves

- **User authentication for different user roles**.
  - Doctors (Some Access):
    - Home | Dashboard | Appointments | Medical Tests | Prescriptions
    - Approve/reject/create appointment requests
    - Edit medical records
    - Add medical notes and prescriptions
    - Order tests
  - Patients (Limited Access):
    - Home | Dashboard | Appointments
    - Dashboard – See upcoming appointments, prescriptions, test results 
    - Schedule/cancel appointments
    - View medical history (no edits allowed)
    - Update profile and contact details
  - Managers/Admins:
    - Home | Dashboard | Reports | Billing
    - See system stats (number of patients, doctors, appointments, etc.)
    - Generate reports
- **Data entry forms**.
  - Add new data:
    - Patients can register for the first time
    - Patients can request appointments
    - Doctors can add medical records and prescriptions
    - Admins can add new clinics and doctors
    - Receptionists can register new patients
    - Doctors can request medical tests for a patient
  - Modify existing data:
    - Patients can update their profile and reschedule their appointments
    - Doctors can update patient medical history
    - Admins can modify clinic details
    - Doctors can update or cancel test requests
  - ‘delete’ data:
    - Patients can deactivate their accounts
    - Admins can deactivate employee accounts
    - Doctors can archive old prescriptions
- **Triggers**.
  - Add a SQL trigger so a doctor cannot be double booked
  - Add a trigger that will auto-update the medical record when a test is added
  - Add a trigger for updating billing when a prescription is added
  - Add a trigger that will auto-update the patient's medical record when a prescription is added

- **Data queries**.
  - Get patient appointment history
  - Get a list of all doctors and their specialties
  - Get available time slots for a doctor
  - Get a list of all clinics in a specific state
  - Get the medical record for a specific patient
  - Retrieve all test requests for a specific patient
- **Data reports**.
  - Number of appointments per clinic a month
  - Summary of a patient's treatments and tests
  - patients per doctor, office schedules

## Technologies
- **React**
- **Node.js**
- **MySQL**
