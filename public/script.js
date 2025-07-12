// Global variables
let cocktails = [];
let editingId = null;
let deleteId = null;
let expandedCardId = null;

// DOM elements
const cocktailForm = document.getElementById("cocktail-form");
const cocktailsList = document.getElementById("cocktails-list");
const searchInput = document.getElementById("search-input");
const loading = document.getElementById("loading");
const noCocktails = document.getElementById("no-cocktails");
const modal = document.getElementById("modal");
const deleteCocktailName = document.getElementById("delete-cocktail-name");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");

// API base URL
const API_BASE = "/api/cocktails";

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  loadCocktails();
  setupEventListeners();
  // Hide form by default
  document.getElementById("form-section").style.display = "none";
  // Setup image modal events
  setupImageModal();
});

function setupImageModal() {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("image-modal-img");
  const closeBtn = document.getElementById("image-modal-close");
  // Open modal on image click (event delegation)
  document
    .getElementById("cocktails-list")
    .addEventListener("click", function (e) {
      const img = e.target.closest(".cocktail-image");
      if (img) {
        e.stopPropagation();
        modalImg.src = img.src;
        modal.classList.add("show");
        return;
      }
    });
  // Close modal on close button
  closeBtn.addEventListener("click", function () {
    modal.classList.remove("show");
    modalImg.src = "";
  });
  // Close modal on click outside image
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.classList.remove("show");
      modalImg.src = "";
    }
  });
  // ESC key closes modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      modal.classList.remove("show");
      modalImg.src = "";
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  cocktailForm.addEventListener("submit", handleFormSubmit);

  // Search functionality
  searchInput.addEventListener("input", handleSearch);

  // Modal events
  confirmDeleteBtn.addEventListener("click", handleConfirmDelete);
  cancelDeleteBtn.addEventListener("click", closeModal);

  // Cancel edit
  cancelBtn.addEventListener("click", cancelEdit);

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Floating add button
  document
    .getElementById("show-form-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      showForm();
    });
  // Close form button
  document
    .getElementById("close-form-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      hideForm();
    });
  // Also hide form on cancel
  cancelBtn.addEventListener("click", function () {
    hideForm();
  });
}

function showForm() {
  document.getElementById("form-section").style.display = "block";
  document.getElementById("show-form-btn").style.display = "none";
}

function hideForm() {
  document.getElementById("form-section").style.display = "none";
  document.getElementById("show-form-btn").style.display = "flex";
  resetForm();
}

// Load all cocktails
async function loadCocktails() {
  try {
    showLoading(true);
    const response = await fetch(API_BASE);

    if (!response.ok) {
      throw new Error("Failed to load cocktails");
    }

    cocktails = await response.json();
    displayCocktails(cocktails);
  } catch (error) {
    console.error("Error loading cocktails:", error);
    showMessage("Error loading cocktails", "error");
  } finally {
    showLoading(false);
  }
}

// Display cocktails in the grid
function displayCocktails(cocktailsToShow) {
  if (cocktailsToShow.length === 0) {
    cocktailsList.innerHTML = "";
    noCocktails.style.display = "block";
    return;
  }

  noCocktails.style.display = "none";

  const cocktailsHTML = cocktailsToShow
    .map((cocktail) => {
      const isExpanded = expandedCardId === cocktail.id;
      return `
        <div class="cocktail-card${isExpanded ? " expanded" : ""}" data-id="${
        cocktail.id
      }">
            ${
              cocktail.theJpeg
                ? `<img src="${escapeHtml(cocktail.theJpeg)}" alt="${escapeHtml(
                    cocktail.theCock
                  )}" class="cocktail-image" onerror="this.style.display='none'">`
                : ""
            }
            <div class="cocktail-header" onclick="toggleCardExpand(event, ${
              cocktail.id
            })" style="cursor:pointer;">
                <div>
                    <h3 class="cocktail-name">${escapeHtml(
                      cocktail.theCock
                    )}</h3>
                </div>
                <div class="cocktail-actions">
                    ${
                      isExpanded
                        ? `<button class="btn btn-secondary btn-collapse" onclick="collapseCard(event, ${cocktail.id})"><i class="fas fa-times"></i></button>`
                        : `<button class="btn btn-primary btn-expand"><i class="fas fa-plus"></i></button>`
                    }
                </div>
            </div>
            <div class="cocktail-details" style="display:${
              isExpanded ? "block" : "none"
            };">
                <div class="cocktail-ingredients">
                    <h4>Ingredients</h4>
                    <p>${escapeHtml(cocktail.theIngredients)}</p>
                </div>
                <div class="cocktail-recipe">
                    <h4>Recipe</h4>
                    <p>${escapeHtml(cocktail.theRecipe)}</p>
                </div>
                ${
                  cocktail.theComment
                    ? `<div class="cocktail-comment">${escapeHtml(
                        cocktail.theComment
                      )}</div>`
                    : ""
                }
                <div class="cocktail-edit-delete">
                    <button class="btn btn-edit" onclick="editCocktail(${
                      cocktail.id
                    });event.stopPropagation();"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-delete" onclick="deleteCocktail(${
                      cocktail.id
                    }, '${escapeHtml(
        cocktail.theCock
      )}');event.stopPropagation();"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
        `;
    })
    .join("");

  cocktailsList.innerHTML = cocktailsHTML;
}

// Expand/collapse logic
window.toggleCardExpand = function (event, id) {
  // Only expand if not already expanded
  if (expandedCardId !== id) {
    expandedCardId = id;
  } else {
    expandedCardId = null;
  }
  displayCocktails(cocktails);
  event.stopPropagation();
};

window.collapseCard = function (event, id) {
  expandedCardId = null;
  displayCocktails(cocktails);
  event.stopPropagation();
};

// Image upload logic
const fileInput = document.getElementById("theJpegFile");
const imageUrlInput = document.getElementById("theJpeg");
const imagePreview = document.getElementById("image-upload-preview");
let uploadedImagePath = null;

if (fileInput) {
  fileInput.addEventListener("change", async function (e) {
    const file = fileInput.files[0];
    if (!file) return;
    imagePreview.innerHTML = "";
    uploadedImagePath = null;
    // Show preview
    const reader = new FileReader();
    reader.onload = function (ev) {
      imagePreview.innerHTML = `<img src="${ev.target.result}" alt="Preview" style="max-width:120px;max-height:80px;border-radius:8px;box-shadow:0 2px 8px #ccc;">`;
    };
    reader.readAsDataURL(file);
    // Upload file
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.filePath) {
        uploadedImagePath = data.filePath;
        // Optionally show a checkmark or success message
      } else {
        imagePreview.innerHTML += `<div style='color:red;'>Upload failed: ${
          data.error || "Unknown error"
        }</div>`;
      }
    } catch (err) {
      imagePreview.innerHTML += `<div style='color:red;'>Upload failed</div>`;
    }
  });
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(cocktailForm);
  let theJpegValue = uploadedImagePath || formData.get("theJpeg") || null;
  const cocktailData = {
    theCock: formData.get("theCock"),
    theIngredients: formData.get("theIngredients"),
    theRecipe: formData.get("theRecipe"),
    theJpeg: theJpegValue,
    theComment: formData.get("theComment") || null,
  };

  try {
    if (editingId) {
      // Update existing cocktail
      await updateCocktail(editingId, cocktailData);
      showMessage("Cocktail updated successfully!", "success");
    } else {
      // Create new cocktail
      await createCocktail(cocktailData);
      showMessage("Cocktail added successfully!", "success");
    }

    resetForm();
    await loadCocktails();
    hideForm(); // Hide form after submit
  } catch (error) {
    console.error("Error saving cocktail:", error);
    showMessage("Error saving cocktail", "error");
  }
}

// Create new cocktail
async function createCocktail(cocktailData) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cocktailData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create cocktail");
  }

  return await response.json();
}

// Update existing cocktail
async function updateCocktail(id, cocktailData) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cocktailData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update cocktail");
  }

  return await response.json();
}

// Edit cocktail
function editCocktail(id) {
  const cocktail = cocktails.find((c) => c.id === id);
  if (!cocktail) return;

  editingId = id;
  formTitle.textContent = "Edit Cocktail";
  cancelBtn.style.display = "inline-flex";

  // Populate form
  document.getElementById("cocktail-id").value = cocktail.id;
  document.getElementById("theCock").value = cocktail.theCock;
  document.getElementById("theIngredients").value = cocktail.theIngredients;
  document.getElementById("theRecipe").value = cocktail.theRecipe;
  document.getElementById("theJpeg").value = cocktail.theJpeg || "";
  document.getElementById("theComment").value = cocktail.theComment || "";

  // Scroll to form
  document
    .querySelector(".form-section")
    .scrollIntoView({ behavior: "smooth" });
}

// Cancel edit
function cancelEdit() {
  editingId = null;
  resetForm();
}

// Reset form
function resetForm() {
  cocktailForm.reset();
  editingId = null;
  formTitle.textContent = "Add New Cocktail";
  cancelBtn.style.display = "none";
  document.getElementById("cocktail-id").value = "";
}

// Delete cocktail
function deleteCocktail(id, name) {
  deleteId = id;
  deleteCocktailName.textContent = name;
  modal.style.display = "block";
}

// Handle confirm delete
async function handleConfirmDelete() {
  if (!deleteId) return;

  try {
    const response = await fetch(`${API_BASE}/${deleteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete cocktail");
    }

    showMessage("Cocktail deleted successfully!", "success");
    await loadCocktails();
  } catch (error) {
    console.error("Error deleting cocktail:", error);
    showMessage("Error deleting cocktail", "error");
  } finally {
    closeModal();
    deleteId = null;
  }
}

// Close modal
function closeModal() {
  modal.style.display = "none";
  deleteId = null;
}

// Handle search
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (!searchTerm) {
    displayCocktails(cocktails);
    return;
  }

  const filteredCocktails = cocktails.filter(
    (cocktail) =>
      cocktail.theCock.toLowerCase().includes(searchTerm) ||
      cocktail.theIngredients.toLowerCase().includes(searchTerm) ||
      cocktail.theRecipe.toLowerCase().includes(searchTerm) ||
      (cocktail.theComment &&
        cocktail.theComment.toLowerCase().includes(searchTerm))
  );

  displayCocktails(filteredCocktails);
}

// Show/hide loading state
function showLoading(show) {
  loading.style.display = show ? "block" : "none";
  if (show) {
    noCocktails.style.display = "none";
  }
}

// Show message
function showMessage(message, type = "success") {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".message");
  existingMessages.forEach((msg) => msg.remove());

  // Create new message
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Insert at the top of the main content
  const mainContent = document.querySelector(".main-content");
  mainContent.insertBefore(messageDiv, mainContent.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
