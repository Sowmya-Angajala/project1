const firebaseConfig = {
  apiKey: "AIzaSyAwNHVDGoNdClw0ov1hj3pmpyatpVPmZFE",
  authDomain: "hospitalclinicmanagementsystem.firebaseapp.com",
  projectId: "hospitalclinicmanagementsystem",
  storageBucket: "hospitalclinicmanagementsystem.firebasestorage.app",
  messagingSenderId: "825448547395",
  appId: "1:825448547395:web:619ad1357b6c7a091140f6",
  measurementId: "G-JKFPQ3682R",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function handleAuthStateChanged(user) {
  const authSection = document.getElementById("auth-section");
  const dashboard = document.getElementById("dashboard");
  const navbar = document.getElementById("navbar");

  if (user) {
    authSection.style.display = "none";
    dashboard.style.display = "block";
    navbar.style.display = "flex";
    navigateTo("patient-registration");
  } else {
    authSection.style.display = "block";
    dashboard.style.display = "none";
    navbar.style.display = "none";
    showLogin();

    // Hide all sections when logged out
    const sections = [
      "patient-registration",
      "appointment-section",
      "medical-records-section",
      "billing-section",
      "patient-portal-section",
    ];
    sections.forEach((id) => {
      document.getElementById(id).style.display = "none";
    });
  }
}

// Initialize all event listeners
window.onload = () => {
  // Authentication
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("signupBtn").addEventListener("click", signup);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Forms
  document
    .getElementById("registerForm")
    .addEventListener("submit", registerPatient);
  document
    .getElementById("appointmentForm")
    .addEventListener("submit", bookAppointment);
  document
    .getElementById("billingForm")
    .addEventListener("submit", generateInvoice);

  // Records
  document
    .getElementById("searchBtn")
    .addEventListener("click", searchPatientRecords);
  document
    .getElementById("updateRecordBtn")
    .addEventListener("click", updateMedicalRecord);

  // Patient Portal
  document
    .getElementById("sendMessageBtn")
    .addEventListener("click", sendMessageToDoctor);

  // Check auth state
  auth.onAuthStateChanged(handleAuthStateChanged);
};

// Authentication Functions
function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}

function showLogin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorP = document.getElementById("login-error");

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      errorP.textContent = "";
    })
    .catch((error) => {
      errorP.textContent = error.message;
    });
}

function signup() {
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;
  const errorP = document.getElementById("signup-error");

  if (password !== confirmPassword) {
    errorP.textContent = "Passwords don't match!";
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: name,
      });
    })
    .then(() => {
      showLogin();
      document.getElementById("email").value = email;
      errorP.textContent = "";
    })
    .catch((error) => {
      errorP.textContent = error.message;
    });
}

function logout() {
  auth.signOut();
}

function handleAuthStateChanged(user) {
  const authSection = document.getElementById("auth-section");
  const dashboard = document.getElementById("dashboard");
  const navbar = document.getElementById("navbar");

  if (user) {
    authSection.style.display = "none";
    dashboard.style.display = "block";
    navbar.style.display = "flex";
    navigateTo("patient-registration");
  } else {
    authSection.style.display = "block";
    dashboard.style.display = "none";
    navbar.style.display = "none";
    showLogin();

    // Hide all sections when logged out
    const sections = [
      "patient-registration",
      "appointment-section",
      "medical-records-section",
      "billing-section",
      "patient-portal-section",
    ];
    sections.forEach((id) => {
      document.getElementById(id).style.display = "none";
    });
  }
}

// Patient Registration
function registerPatient(e) {
  e.preventDefault();

  const name = document.getElementById("patientName").value.trim();
  const age = document.getElementById("patientAge").value.trim();
  const gender = document.getElementById("patientGender").value;
  const contact = document.getElementById("patientContact").value.trim();
  const address = document.getElementById("patientAddress").value.trim();
  const history = document.getElementById("patientHistory").value.trim();
  const msg = document.getElementById("registerMessage");

  if (!name || !age || !gender || !contact || !address) {
    msg.style.color = "red";
    msg.textContent = "Please fill all required fields.";
    return;
  }

  db.ref("patients")
    .push()
    .set({
      name,
      age,
      gender,
      contact,
      address,
      medicalHistory: history,
      registeredAt: new Date().toISOString(),
    })
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Patient registered successfully!";
      document.getElementById("registerForm").reset();
    })
    .catch((error) => {
      msg.style.color = "red";
      msg.textContent = "Error: " + error.message;
    });
}

// Appointment Booking
function bookAppointment(e) {
  e.preventDefault();

  const name = document.getElementById("apptPatientName").value.trim();
  const doctor = document.getElementById("apptDoctor").value;
  const date = document.getElementById("apptDate").value;
  const time = document.getElementById("apptTime").value;
  const msg = document.getElementById("appointmentMessage");

  if (!name || !doctor || !date || !time) {
    msg.style.color = "red";
    msg.textContent = "All fields are required!";
    return;
  }

  db.ref("appointments")
    .orderByChild("doctorDateTime")
    .equalTo(`${doctor}_${date}_${time}`)
    .once("value", (snapshot) => {
      if (snapshot.exists()) {
        msg.style.color = "red";
        msg.textContent = "This slot is already booked. Choose another time.";
      } else {
        db.ref("appointments")
          .push({
            patientName: name,
            doctor,
            date,
            time,
            doctorDateTime: `${doctor}_${date}_${time}`,
            bookedAt: new Date().toISOString(),
          })
          .then(() => {
            msg.style.color = "green";
            msg.textContent = "Appointment booked successfully!";
            document.getElementById("appointmentForm").reset();
          });
      }
    });
}

// Medical Records
function searchPatientRecords() {
  const name = document.getElementById("searchPatientName").value.trim();
  const msg = document.getElementById("recordMessage");
  msg.textContent = "";

  if (!name) {
    alert("Enter patient name to search.");
    return;
  }

  db.ref("medicalRecords")
    .child(name)
    .once("value", (snapshot) => {
      const recordData = snapshot.val();

      document.getElementById("recordPatientName").textContent = name;
      document.getElementById("recordDetails").style.display = "block";

      if (recordData && recordData.entries) {
        document.getElementById("existingRecords").value =
          recordData.entries.join("\n\n---\n\n");
      } else {
        document.getElementById("existingRecords").value =
          "No existing records.";
      }
    });
}

function updateMedicalRecord() {
  const name = document.getElementById("recordPatientName").textContent;
  const newEntry = document.getElementById("newRecordEntry").value.trim();
  const msg = document.getElementById("recordMessage");

  if (!newEntry) {
    msg.style.color = "red";
    msg.textContent = "Please add a new record entry.";
    return;
  }

  const recordRef = db.ref("medicalRecords").child(name);

  recordRef.child("entries").once("value", (snapshot) => {
    let existing = snapshot.val() || [];
    existing.push(`[${new Date().toLocaleString()}] ${newEntry}`);

    recordRef.set({ entries: existing }).then(() => {
      msg.style.color = "green";
      msg.textContent = "Record updated successfully!";
      document.getElementById("existingRecords").value =
        existing.join("\n\n---\n\n");
      document.getElementById("newRecordEntry").value = "";
    });
  });
}

// Billing
function generateInvoice(e) {
  e.preventDefault();

  const patientName = document.getElementById("billPatientName").value.trim();
  const serviceInputs = document.querySelectorAll(".service");
  const feeInputs = document.querySelectorAll(".fee");
  const message = document.getElementById("billingMessage");

  let services = [];
  let total = 0;

  for (let i = 0; i < serviceInputs.length; i++) {
    const service = serviceInputs[i].value.trim();
    const fee = parseFloat(feeInputs[i].value);

    if (service && !isNaN(fee)) {
      services.push({ service, fee });
      total += fee;
    }
  }

  if (!patientName || services.length === 0) {
    message.style.color = "red";
    message.textContent = "Please enter patient name and at least one service.";
    return;
  }

  const invoice = {
    patientName,
    services,
    totalAmount: total,
    createdAt: new Date().toISOString(),
  };

  db.ref("billing")
    .push(invoice)
    .then(() => {
      message.style.color = "green";
      message.textContent = `Invoice generated! Total: ₹${total.toFixed(2)}`;
      document.getElementById("billingForm").reset();
    })
    .catch((err) => {
      message.style.color = "red";
      message.textContent = "Error: " + err.message;
    });
}

// Patient Portal
function sendMessageToDoctor() {
  const msgBox = document.getElementById("patientMessage");
  const status = document.getElementById("messageStatus");
  const content = msgBox.value.trim();

  if (!content) {
    status.style.color = "red";
    status.textContent = "Please write a message.";
    return;
  }

  const user = auth.currentUser;
  const sender = user.displayName || user.email;

  db.ref("patientMessages")
    .push({
      sender,
      message: content,
      sentAt: new Date().toISOString(),
    })
    .then(() => {
      status.style.color = "green";
      status.textContent = "Message sent to doctor.";
      msgBox.value = "";
    });
}

// Navigation
function navigateTo(sectionId) {
  const sections = [
    "patient-registration",
    "appointment-section",
    "medical-records-section",
    "billing-section",
    "patient-portal-section",
  ];

  sections.forEach((id) => {
    document.getElementById(id).style.display = "none";
  });

  document.getElementById(sectionId).style.display = "block";

  // Update active button in navbar
  const buttons = document.querySelectorAll("#navbar button");
  buttons.forEach((btn) => btn.classList.remove("active"));

  // Set the clicked button as active
  const activeBtn = Array.from(buttons).find((btn) =>
    btn.textContent.toLowerCase().includes(sectionId.split("-")[0])
  );
  if (activeBtn) activeBtn.classList.add("active");

  // Load data for patient portal if that's the selected section
  if (sectionId === "patient-portal-section") {
    loadPatientPortalData();
  }
}

function loadPatientPortalData() {
  const user = auth.currentUser;
  if (!user) return;

  const displayName = user.displayName || user.email.split("@")[0];
  document.getElementById("portalPatientName").textContent = displayName;

  // Load Medical Records
  db.ref("medicalRecords")
    .child(displayName)
    .once("value", (snapshot) => {
      const data = snapshot.val();
      const recordBox = document.getElementById("portalMedicalRecords");
      if (data && data.entries) {
        recordBox.value = data.entries.join("\n\n---\n\n");
      } else {
        recordBox.value = "No records found.";
      }
    });

  // Load Appointments
  db.ref("appointments")
    .orderByChild("patientName")
    .equalTo(displayName)
    .once("value", (snapshot) => {
      const appointments = snapshot.val();
      const ul = document.getElementById("portalAppointmentsList");
      ul.innerHTML = "";

      if (appointments) {
        Object.values(appointments).forEach((app) => {
          const li = document.createElement("li");
          li.textContent = `${app.date} at ${app.time} with ${app.doctor}`;
          ul.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "No appointments scheduled.";
        ul.appendChild(li);
      }
    });
}


