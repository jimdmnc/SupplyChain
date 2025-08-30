// Wizard Functionality for Add Material Modal

document.addEventListener("DOMContentLoaded", () => {
  let currentWizardStep = 1;
  const totalWizardSteps = 5;

  // Wizard DOM Elements
  const wizardStepNumber = document.getElementById("wizard-step-number");
  const wizardProgress = document.getElementById("wizard-progress");
  const wizardPrevBtn = document.getElementById("wizard-prev-btn");
  const wizardNextBtn = document.getElementById("wizard-next-btn");
  const wizardSaveBtn = document.getElementById("wizard-save-btn");

  // Initialize wizard functionality
  initializeWizard();

  function initializeWizard() {
    // Add event listeners for wizard navigation
    if (wizardNextBtn) {
      wizardNextBtn.addEventListener("click", () => {
        if (validateCurrentStep()) {
          nextWizardStep();
        }
      });
    }

    if (wizardPrevBtn) {
      wizardPrevBtn.addEventListener("click", () => {
        previousWizardStep();
      });
    }

    // Add event listeners for step validation
    addStepValidationListeners();
  }

  function resetWizard() {
    currentWizardStep = 1;

    // Hide all steps
    const allSteps = document.querySelectorAll(".wizard-step-content");
    allSteps.forEach((step) => {
      step.classList.add("d-none");
    });

    // Show first step
    const firstStep = document.getElementById("step-1");
    if (firstStep) {
      firstStep.classList.remove("d-none");
    }

    // Reset progress bar
    const progressBar = document.getElementById("wizard-progress");
    if (progressBar) {
      progressBar.style.width = "20%";
    }

    // Reset step number display
    const stepNumber = document.getElementById("wizard-step-number");
    if (stepNumber) {
      stepNumber.textContent = "1";
    }

    // Reset step indicators
    updateStepIndicators();

    // Reset navigation buttons
    updateNavigationButtons();
  }

  function updateWizardUI() {
    // Update step number display
    if (wizardStepNumber) {
      wizardStepNumber.textContent = currentWizardStep;
    }

    // Update progress bar
    if (wizardProgress) {
      const progressPercentage = (currentWizardStep / totalWizardSteps) * 100;
      wizardProgress.style.width = progressPercentage + "%";
    }

    // Update step indicators
    updateStepIndicators();

    // Update navigation buttons
    updateNavigationButtons();
  }

  function updateStepIndicators() {
    const stepElements = document.querySelectorAll(".wizard-step");
    stepElements.forEach((step, index) => {
      const stepNumber = index + 1;
      if (stepNumber < currentWizardStep) {
        step.classList.remove("text-muted");
        step.classList.add("text-success");
        step.innerHTML = `<i class="bi bi-check-circle me-1"></i>${step.textContent}`;
      } else if (stepNumber === currentWizardStep) {
        step.classList.remove("text-muted", "text-success");
        step.classList.add("text-primary", "fw-bold");
        step.innerHTML = step.textContent;
      } else {
        step.classList.remove("text-primary", "text-success", "fw-bold");
        step.classList.add("text-muted");
        step.innerHTML = step.textContent;
      }
    });
  }

  function updateNavigationButtons() {
    if (wizardPrevBtn) {
      if (currentWizardStep === 1) {
        wizardPrevBtn.style.display = "none";
      } else {
        wizardPrevBtn.style.display = "inline-block";
      }
    }

    if (wizardNextBtn && wizardSaveBtn) {
      if (currentWizardStep === totalWizardSteps) {
        wizardNextBtn.style.display = "none";
        wizardSaveBtn.style.display = "inline-block";
      } else {
        wizardNextBtn.style.display = "inline-block";
        wizardSaveBtn.style.display = "none";
      }
    }
  }

  function showStep(stepNumber) {
    // Hide all steps
    const stepContents = document.querySelectorAll(".wizard-step-content");
    stepContents.forEach((step) => {
      step.classList.add("d-none");
    });

    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.remove("d-none");
    }
  }

  async function nextWizardStep() {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentWizardStep < totalWizardSteps) {
        currentWizardStep++;
        updateWizardUI();
        showStep(currentWizardStep);
      }
    }
  }

  function previousWizardStep() {
    if (currentWizardStep > 1) {
      currentWizardStep--;
      updateWizardUI();
      showStep(currentWizardStep);
    }
  }

  async function validateCurrentStep() {
    const currentStepElement = document.getElementById(
      `step-${currentWizardStep}`
    );
    if (!currentStepElement) return true;

    const requiredFields = currentStepElement.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add("is-invalid");

        // Add validation message
        let validationMessage =
          field.parentNode.querySelector(".invalid-feedback");
        if (!validationMessage) {
          validationMessage = document.createElement("div");
          validationMessage.className = "invalid-feedback";
          validationMessage.textContent = "This field is required.";
          field.parentNode.appendChild(validationMessage);
        }
      } else {
        field.classList.remove("is-invalid");
        const validationMessage =
          field.parentNode.querySelector(".invalid-feedback");
        if (validationMessage) {
          validationMessage.remove();
        }
      }
    });

    // Step-specific validation
    switch (currentWizardStep) {
      case 1:
        // Basic info validation
        const materialName = document.getElementById("material_name");
        const category = document.getElementById("category");

        // Check if category is null, empty, or "Select category"
        if (
          !category.value ||
          category.value === "" ||
          category.value === "Select category"
        ) {
          isValid = false;
          category.classList.add("is-invalid");
          showFieldError(category, "Please select a category.");
          showStepError("Please select a valid category.");
          return false;
        }

        // Check if material name is empty
        if (!materialName.value.trim()) {
          isValid = false;
          materialName.classList.add("is-invalid");
          showFieldError(materialName, "Material name is required.");
          showStepError("Please enter a material name.");
          return false;
        }

        // Check if material exists
        return checkMaterialExists(materialName.value.trim()).then((exists) => {
          if (exists) {
            isValid = false;
            materialName.classList.add("is-invalid");
            showFieldError(materialName, "This material name already exists.");
            showStepError("Please use a different material name.");
          }
          return isValid;
        });

        // Check if material name already exists
        return checkMaterialExists(materialName.value.trim()).then((exists) => {
          if (exists) {
            isValid = false;
            materialName.classList.add("is-invalid");
            showFieldError(materialName, "This material name already exists.");
            showStepError("Please use a different material name.");
          }
          return isValid;
        });
        break;

      case 2:
        // Measurement validation
        const measurementType = document.getElementById("measurement_type");
        const unitMeasurement = document.getElementById("unit_measurement");
        const piecesPerContainer = document.getElementById(
          "pieces_per_container"
        );
        const baseUnit = document.getElementById("base_unit");

        isValid = true;

        // Check measurement type
        if (
          !measurementType.value ||
          measurementType.value === "Select measurement type"
        ) {
          isValid = false;
          measurementType.classList.add("is-invalid");
          showFieldError(measurementType, "Please select a measurement type.");
        }

        // Check unit measurement if Unit or Bulk is selected
        if (
          (measurementType.value === "Unit" ||
            measurementType.value === "Bulk") &&
          (!unitMeasurement.value || unitMeasurement.value === "Select unit")
        ) {
          isValid = false;
          unitMeasurement.classList.add("is-invalid");
          showFieldError(
            unitMeasurement,
            "Please select a unit of measurement."
          );
        }

        // Check pieces per container if Pack or Box is selected
        if (
          (measurementType.value === "Pack" ||
            measurementType.value === "Box") &&
          (!piecesPerContainer.value || piecesPerContainer.value <= 0)
        ) {
          isValid = false;
          piecesPerContainer.classList.add("is-invalid");
          showFieldError(
            piecesPerContainer,
            "Please enter number of pieces per container."
          );
        }

        // Check base unit
        if (!baseUnit.value) {
          isValid = false;
          baseUnit.classList.add("is-invalid");
          showFieldError(baseUnit, "Please select a base unit for tracking.");
        }

        if (!isValid) {
          showStepError(
            "Please fill in all measurement information correctly."
          );
        }

        return isValid;
        break;

      case 3:
        // Quantity and cost validation
        const quantity = document.getElementById("quantity");
        const cost = document.getElementById("cost");

        if (quantity && (quantity.value <= 0 || quantity.value === "")) {
          isValid = false;
          quantity.classList.add("is-invalid");
          showFieldError(quantity, "Quantity must be greater than 0.");
        }

        if (cost && (cost.value <= 0 || cost.value === "")) {
          isValid = false;
          cost.classList.add("is-invalid");
          showFieldError(cost, "Cost must be greater than 0.");
        }
        break;

      case 4:
        // Supplier validation
        const supplier = document.getElementById("supplier");
        if (supplier && supplier.value === "") {
          isValid = false;
          supplier.classList.add("is-invalid");
          showFieldError(supplier, "Please select a supplier.");
        }
        break;

      case 5:
        // Documentation validation
        const dateReceived = document.getElementById("date_received");
        const receiptUpload = document.getElementById("receipt_upload");
        const notes = document.getElementById("notes");
        const expiryDate = document.getElementById("expiry_date");

        // Date validation helper function
        const isValidDate = (dateString) => {
          const date = new Date(dateString);
          return date instanceof Date && !isNaN(date);
        };

        // Required field: Date Received
        if (!dateReceived || !dateReceived.value) {
          isValid = false;
          dateReceived.classList.add("is-invalid");
          showFieldError(dateReceived, "Please select a date received.");
        } else if (!isValidDate(dateReceived.value)) {
          isValid = false;
          dateReceived.classList.add("is-invalid");
          showFieldError(dateReceived, "Please enter a valid date.");
        } else {
          const receivedDate = new Date(dateReceived.value);
          const today = new Date();

          // Cannot select future date for received date
          if (receivedDate > today) {
            isValid = false;
            dateReceived.classList.add("is-invalid");
            showFieldError(
              dateReceived,
              "Date received cannot be in the future."
            );
          }
        }

        // Validate expiry date if provided
        if (expiryDate && expiryDate.value) {
          if (!isValidDate(expiryDate.value)) {
            isValid = false;
            expiryDate.classList.add("is-invalid");
            showFieldError(expiryDate, "Please enter a valid expiry date.");
          } else {
            const expiry = new Date(expiryDate.value);
            const received = new Date(dateReceived.value);

            // Expiry date must be after received date
            if (expiry <= received) {
              isValid = false;
              expiryDate.classList.add("is-invalid");
              showFieldError(
                expiryDate,
                "Expiry date must be after date received."
              );
            }
          }
        }

        // Rest of the validation for files and notes
        // Optional but validate file type if uploaded
        if (receiptUpload && receiptUpload.files.length > 0) {
          const file = receiptUpload.files[0];
          const validTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
          ];

          if (!validTypes.includes(file.type)) {
            isValid = false;
            receiptUpload.classList.add("is-invalid");
            showFieldError(
              receiptUpload,
              "Please upload only PDF or image files (jpg, jpeg, png)."
            );
          }

          // Check file size (max 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB in bytes
          if (file.size > maxSize) {
            isValid = false;
            receiptUpload.classList.add("is-invalid");
            showFieldError(receiptUpload, "File size must be less than 5MB.");
          }
        }

        // Validate notes if entered (optional but validate length if present)
        if (notes && notes.value.trim() !== "") {
          if (notes.value.length > 1000) {
            // Max 1000 characters
            isValid = false;
            notes.classList.add("is-invalid");
            showFieldError(notes, "Notes must be less than 1000 characters.");
          }
        }

        if (!isValid) {
          showStepError("Please fill in all required documentation correctly.");
        }

        return isValid;
        break;
    }

    if (!isValid) {
      showStepError("Please fill in all required fields correctly.");
    }

    return isValid;
  }

  function showFieldError(field, message) {
    let validationMessage = field.parentNode.querySelector(".invalid-feedback");
    if (!validationMessage) {
      validationMessage = document.createElement("div");
      validationMessage.className = "invalid-feedback";
      field.parentNode.appendChild(validationMessage);
    }
    validationMessage.textContent = message;
  }

  function showStepError(message) {
    // Create or update step error message
    let stepError = document.querySelector(".wizard-step-error");
    if (!stepError) {
      stepError = document.createElement("div");
      stepError.className = "alert alert-danger wizard-step-error mt-3";
      const currentStepElement = document.getElementById(
        `step-${currentWizardStep}`
      );
      if (currentStepElement) {
        currentStepElement.appendChild(stepError);
      }
    }
    stepError.textContent = message;
  }

  function addStepValidationListeners() {
    // Add real-time validation for key fields
    const materialName = document.getElementById("material_name");
    if (materialName) {
      materialName.addEventListener("input", () => {
        if (materialName.value.trim().length >= 2) {
          materialName.classList.remove("is-invalid");
          const validationMessage =
            materialName.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const category = document.getElementById("category");
    if (category) {
      category.addEventListener("change", () => {
        if (category.value !== "") {
          category.classList.remove("is-invalid");
          const validationMessage =
            category.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const measurementType = document.getElementById("measurement_type");
    if (measurementType) {
      measurementType.addEventListener("change", () => {
        if (measurementType.value !== "") {
          measurementType.classList.remove("is-invalid");
          const validationMessage =
            measurementType.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const quantity = document.getElementById("quantity");
    if (quantity) {
      quantity.addEventListener("input", () => {
        if (quantity.value > 0) {
          quantity.classList.remove("is-invalid");
          const validationMessage =
            quantity.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const cost = document.getElementById("cost");
    if (cost) {
      cost.addEventListener("input", () => {
        if (cost.value > 0) {
          cost.classList.remove("is-invalid");
          const validationMessage =
            cost.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const supplier = document.getElementById("supplier");
    if (supplier) {
      supplier.addEventListener("change", () => {
        if (supplier.value !== "") {
          supplier.classList.remove("is-invalid");
          const validationMessage =
            supplier.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const dateReceived = document.getElementById("date_received");
    if (dateReceived) {
      dateReceived.addEventListener("change", () => {
        if (dateReceived.value !== "") {
          dateReceived.classList.remove("is-invalid");
          const validationMessage =
            dateReceived.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const unitMeasurement = document.getElementById("unit_measurement");
    if (unitMeasurement) {
      unitMeasurement.addEventListener("change", () => {
        if (
          unitMeasurement.value !== "" &&
          unitMeasurement.value !== "Select unit"
        ) {
          unitMeasurement.classList.remove("is-invalid");
          const validationMessage =
            unitMeasurement.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const piecesPerContainer = document.getElementById("pieces_per_container");
    if (piecesPerContainer) {
      piecesPerContainer.addEventListener("input", () => {
        if (piecesPerContainer.value > 0) {
          piecesPerContainer.classList.remove("is-invalid");
          const validationMessage =
            piecesPerContainer.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const baseUnit = document.getElementById("base_unit");
    if (baseUnit) {
      baseUnit.addEventListener("change", () => {
        if (baseUnit.value !== "") {
          baseUnit.classList.remove("is-invalid");
          const validationMessage =
            baseUnit.parentNode.querySelector(".invalid-feedback");
          if (validationMessage) {
            validationMessage.remove();
          }
        }
      });
    }

    const expiryDate = document.getElementById("expiry_date");
    if (expiryDate) {
      expiryDate.addEventListener("change", () => {
        const dateReceived = document.getElementById("date_received");
        if (expiryDate.value !== "") {
          const expiry = new Date(expiryDate.value);
          const received = new Date(dateReceived.value);

          if (expiry <= received) {
            expiryDate.classList.add("is-invalid");
            showFieldError(
              expiryDate,
              "Expiry date must be after date received."
            );
          } else {
            expiryDate.classList.remove("is-invalid");
            const validationMessage =
              expiryDate.parentNode.querySelector(".invalid-feedback");
            if (validationMessage) {
              validationMessage.remove();
            }
          }
        }
      });
    }
  }

  // Expose resetWizard function globally so it can be called from other scripts
  window.resetWizard = resetWizard;

  // Add event listener for modal close/cancel
  const addMaterialModal = document.getElementById("addMaterialModal");
  if (addMaterialModal) {
    addMaterialModal.addEventListener("hidden.bs.modal", () => {
      resetWizard();
      // Reset the form
      const form = document.getElementById("add-material-form");
      if (form) {
        form.reset();
      }
      // Clear any error messages
      const errorMessages = document.querySelectorAll(
        ".invalid-feedback, .wizard-step-error"
      );
      errorMessages.forEach((element) => element.remove());
      // Clear invalid states
      const invalidFields = document.querySelectorAll(".is-invalid");
      invalidFields.forEach((field) => field.classList.remove("is-invalid"));
    });
  }

  // Add event listener for cancel button
  const cancelButton = addMaterialModal.querySelector(
    '[data-bs-dismiss="modal"]'
  );
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      resetWizard();
      // Reset the form
      const form = document.getElementById("add-material-form");
      if (form) {
        form.reset();
      }
      // Clear any error messages
      const errorMessages = document.querySelectorAll(
        ".invalid-feedback, .wizard-step-error"
      );
      errorMessages.forEach((element) => element.remove());
      // Clear invalid states
      const invalidFields = document.querySelectorAll(".is-invalid");
      invalidFields.forEach((field) => field.classList.remove("is-invalid"));
    });
  }
});

// Add this new function to check if material exists
async function checkMaterialExists(materialName) {
  try {
    const response = await fetch(
      `check_material.php?name=${encodeURIComponent(materialName)}`
    );
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking material:", error);
    return false;
  }
}
