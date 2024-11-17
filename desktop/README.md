# Structure

## **Page Names**

1. **Dashboard**: Replaces "Home Page."
2. **Groups**: Replaces "Group Page."
3. **Student Profile**: Replaces "Student Page."
4. **Settings**: Retains its name.

---

## **Feature Details**

### **1. Dashboard**

- **Purpose**: Central hub for navigation and basic system information.
- **Features**:
  - Dropdown for group selection.
  - Buttons:
    - **View Group**: Navigate to the selected group page.
    - **Settings**: Navigate to the settings page.

---

### **2. Groups**

- **Purpose**: Manage a specific group's students and analyze group performance.
- **Features**:
  - **Dropdowns**:
    - **Select Lecture**: Searchable dropdown to select a lecture by date.
    - **Change Group**: Dropdown to switch between groups.
  - **Table**:
    - Displays students’ information with columns:
      - ID
      - Name
      - Phone Number
      - Attendance
      - Homework Completion
      - Exam Scores
    - **Row Actions** (buttons displayed when a row is clicked):
      - **Attend**: Mark attendance.
      - **Delete**: Remove the student.
      - **Profile**: Navigate to the student’s profile page.
      - **Block**: Disable the student.
  - **Group Summary**:
    - Total number of students in the group.
    - Analysis **_Charts_**

---

### **3. Student Profile**

- **Purpose**: View and manage an individual student’s details and performance.
- **Features**:
  - **Details Section**:
    - Name, ID, Phone, Parent Phone, and Group Name.
  - **Performance Section**:
    - Attendance Summary: List of lectures with attendance status.
    - Homework Summary: Completion status for homework.
    - Exam Scores: Detailed list of exam scores.
  - **Actions**:
    - Buttons to **Edit**, **Delete**, or **Block** the student.

---

### **4. Settings**

- **Purpose**: Configure app-wide settings and manage system data.
- **Features**:
  - **Backup/Restore**: Save and load app data.
  - **Defaults**: Set default group configurations (e.g., default lecture time).
  - **UI Preferences**: Configure visual settings.

---

## **Application Flow**

1. **Start at Dashboard**:
   - Select a group and navigate to its page.
2. **Groups Page**:
   - Manage students within the selected group.
   - Switch between lectures or groups using dropdowns.
3. **Student Profile**:
   - Drill down into specific student details.
4. **Settings**:
   - Configure app-wide settings when needed.

---

## **Development Documentation**

### **1. Frontend Architecture**

- **Framework**: Electron with Ant Design for UI.
- **UI Components**:
  - Dropdowns: For group and lecture selection.
  - Tables: To display student lists.
  - Buttons: For actions like navigation and data management.
  - Modals: For adding/editing students or groups.

---

### **2. Backend Architecture**

#### _Need edit_

- **Local Database**: Use SQLite or NeDB for simplicity and offline access.
- **API Endpoints**:
  - CRUD for Students (`/students`)
  - CRUD for Groups (`/groups`)
  - Attendance Management (`/attendance`)
  - Exam Management (`/exams`)
  - Homework Management (`/homework`)

---

### **3. Data Models**

#### _Need edit_

1. **Group**:
   - `id`: Unique identifier.
   - `name`: Group/class name.
   - `weekday`: Day of the week.
   - `time`: Time of the lecture.
   - `students`: List of student IDs.
2. **Student**:
   - `id`: Unique identifier.
   - `name`: Full name.
   - `phone`: Contact number.
   - `parentPhone`: Parent’s contact number.
   - `groupId`: Associated group ID.
3. **Attendance**:
   - `id`: Unique identifier.
   - `studentId`: Associated student ID.
   - `lectureDate`: Date of the lecture.
   - `status`: Attended or Absent.
4. **Homework**:
   - `id`: Unique identifier.
   - `studentId`: Associated student ID.
   - `status`: Missing/Partial/Complete.
5. **Exam**:
   - `id`: Unique identifier.
   - `studentId`: Associated student ID.
   - `score`: Exam score.
