document.addEventListener("DOMContentLoaded", () => {
  const dashboardContent = document.getElementById("dashboard-content");
  const questionsSection = document.getElementById("questions-section");
  const questionsNav = document.getElementById("questions-nav");

  // Hide all sections
  function hideAllSections() {
    dashboardContent.classList.add("hidden");
    questionsSection.classList.add("hidden");
  }

  // Show questions section
  questionsNav.addEventListener("click", (e) => {
    e.preventDefault();
    hideAllSections();
    questionsSection.classList.remove("hidden");

    // Initialize questions view if not already initialized
    if (!questionsSection.getAttribute("data-initialized")) {
      renderQuestion(0, 0, "Grammaire");
      questionsSection.setAttribute("data-initialized", "true");
    }
  });

  // Add active state to sidebar links
  const sidebarLinks = document.querySelectorAll("nav a");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sidebarLinks.forEach((l) =>
        l.classList.remove("bg-gray-700", "bg-opacity-25", "text-gray-100")
      );
      link.classList.add("bg-gray-700", "bg-opacity-25", "text-gray-100");
    });
  });
});
