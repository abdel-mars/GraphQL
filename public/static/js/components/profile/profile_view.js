import { LineGraph } from '../visualizations/line_graph.js';
import { BarGraph } from '../visualizations/bar_graph.js';
import { PieChart } from '../visualizations/pie_chart.js';
import { USER_PROFILE_QUERY } from '../../api/queries.js';
import { fetchGraphQLData } from '../../api/graphql_client.js';
import { displayPopup } from '../../utils/display_popup.js';
import { logout } from '../../utils/auth.js';

// Handle profile view rendering
export async function renderProfileView() {
  const app = document.getElementById('app');

  // Remove existing content
  const existingContent = document.querySelector(
    '.signin-container, .profile-container, .about-container, .sidebar, .profile-layout'
  );
  if (existingContent) {
    existingContent.remove();
  }

  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <h3>Dashboard</h3>
    <ul class="sidebar-menu">
      <li><a href="#basic-info" class="sidebar-link active">Basic Information</a></li>
      <li><a href="#audit-stats" class="sidebar-link">Audit Statistics</a></li>
      <li><a href="#xp-stats" class="sidebar-link">XP Statistics</a></li>
      <li><a href="#project-stats" class="sidebar-link">Project Statistics</a></li>
      <li><a href="#completed-projects" class="sidebar-link">Completed Projects</a></li>
      <li><a href="#current-projects" class="sidebar-link">Current Projects</a></li>
      <li><a href="#skills" class="sidebar-link">Skills</a></li>
    </ul>
  `;

  const profileContent = document.createElement('div');
  profileContent.className = 'profile-container';

  // Show loading indicator initially
  profileContent.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading your profile data...</p>
    </div>
  `;

  app.appendChild(sidebar);
  app.appendChild(profileContent);

  // Load profile data after a short delay
  setTimeout(() => {
    profileContent.innerHTML = `
      <div class="profile-header">
        <h2>Welcome to Your Profile</h2>
        <button id="logoutBtn" class="logout-btn">Log Out</button>
      </div>
      <div class="profile-info">
        <div id="basic-info" class="profile-section">
          <h3>Basic Information</h3>
          <div class="profile-details">
            <p><strong>Name:</strong> <span id="fullName">Loading...</span></p>
            <p><strong>Username:</strong> <span id="username">Loading...</span></p>
            <p><strong>Email:</strong> <span id="email">Loading...</span></p>
            <p><strong>Campus:</strong> <span id="campus">Loading...</span></p>
            <p><strong>Current Level:</strong> <span id="level">Loading...</span></p>
          </div>
        </div>
        
        <div id="audit-stats" class="profile-section">
          <h3>Audit Statistics</h3>
          <div class="audit-stats">
            <p><strong>Total Upvotes:</strong> <span id="totalUpvotes">Loading...</span></p>
            <p><strong>Total Downvotes:</strong> <span id="totalDownvotes">Loading...</span></p>
            <p><strong>Audit Ratio:</strong> <span id="auditRatio">Loading...</span></p>
          </div>
          <div id="auditRatioChart" class="chart-container"></div>
        </div>
        
        <div id="xp-stats" class="profile-section">
          <h3>XP Statistics</h3>
          <div class="xp-stats">
            <p><strong>Total XP:</strong> <span id="totalXp">Loading...</span></p>
          </div>
          <div id="xpGraph" class="chart-container"></div>
        </div>

        <div id="project-stats" class="profile-section">
          <h3>Project Statistics</h3>
          <div class="project-stats">
            <p><strong>Completed Projects:</strong> <span id="completedProjects">Loading...</span></p>
            <p><strong>Current Projects:</strong> <span id="currentProjects">Loading...</span></p>
          </div>
          <div id="projectGraph" class="chart-container"></div>
        </div>

        <div id="completed-projects" class="profile-section">
          <h3>Completed Projects</h3>
          <div class="completed-projects-grid" id="completedProjectsGrid">
            <p>Loading completed projects...</p>
          </div>
        </div>

        <div id="current-projects" class="profile-section">
          <h3>Current Projects</h3>
          <div class="current-projects-grid" id="currentProjectsGrid">
            <p>Loading current projects...</p>
          </div>
        </div>

        <div id="skills" class="profile-section">
          <h3>Skills</h3>
          <div class="skills-container">
            <div id="skillsGraph" class="chart-container"></div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        sidebarLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.reload();
      });
    }

    loadProfileData();
  }, 1000);
}

// Handle profile data loading
async function loadProfileData() {
  try {
    const data = await fetchGraphQLData(USER_PROFILE_QUERY);

    if (!data || !data.data || !data.data.user) {
      displayPopup('No user data found', false);
      return;
    }

    const userData = data.data.user[0];

    const welcomeTitle = document.querySelector('.profile-header h2');
    if (welcomeTitle) {
      welcomeTitle.textContent = `Welcome, ${userData.firstName || 'User'}!`;
    }

    updateElementText(
      'fullName',
      `${userData.firstName || ''} ${userData.lastName || ''}`
    );
    updateElementText('username', userData.login || 'N/A');
    updateElementText('email', userData.email || 'N/A');
    updateElementText('campus', userData.campus || 'N/A');
    updateElementText('level', userData.events?.[0]?.level || 'N/A');

    // Update audit statistics
    const totalUp = userData.totalUp || 0;
    const totalDown = userData.totalDown || 0;
    const auditRatio = userData.auditRatio || 'N/A';

    updateElementText('totalUpvotes', totalUp.toString());
    updateElementText('totalDownvotes', totalDown.toString());
    updateElementText('auditRatio', auditRatio.toString());

    // Create and render the pie chart for audit ratio
    const auditRatioChart = document.getElementById('auditRatioChart');
    if (auditRatioChart) {
      const auditRatioData = [
        { label: 'Upvotes', value: totalUp },
        { label: 'Downvotes', value: totalDown },
      ];

      const pieChart = new PieChart(auditRatioData, {
        width: 600,
        height: 300,
        colors: ['#4caf50', '#f44336'], // Green for upvotes, red for downvotes
        showLabels: true,
        showPercentages: true,
        showLegend: true,
      });

      auditRatioChart.innerHTML = '';
      auditRatioChart.appendChild(pieChart.render());
    }

    // Update XP statistics
    const totalXp = userData.totalXp?.aggregate?.sum?.amount || 0;
    updateElementText('totalXp', totalXp.toLocaleString());

    // Create XP progress graph
    const xpGraph = document.getElementById('xpGraph');
    if (xpGraph) {
      const xpData =
        userData.xp?.map((x) => ({
          createdAt: x.createdAt,
          amount: x.amount || 0,
        })) || [];

      if (xpData.length > 0) {
        // Sort data by date
        xpData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Calculate cumulative XP
        let cumulativeXP = 0;
        const cumulativeXpData = xpData.map((item) => {
          cumulativeXP += item.amount;
          return {
            createdAt: item.createdAt,
            amount: cumulativeXP,
          };
        });

        xpGraph.innerHTML = ''; // Clear any existing content
        const lineGraph = new LineGraph(cumulativeXpData, {
          width: 600,
          height: 300,
          padding: 40,
        });
        const svgElement = lineGraph.render();
        xpGraph.appendChild(svgElement);
      } else {
        xpGraph.innerHTML = '<p>No XP data available</p>';
      }
    }

    // Update project statistics
    const completedProjects = userData.completed_projects?.length || 0;
    const currentProjects = userData.current_projects?.length || 0;
    updateElementText('completedProjects', completedProjects.toString());
    updateElementText('currentProjects', currentProjects.toString());

    // Create project status graph
    const projectGraph = document.getElementById('projectGraph');
    if (projectGraph) {
      const projectData = [
        { status: 'Completed', count: completedProjects || 0 },
        { status: 'Current', count: currentProjects || 0 },
      ];

      if (completedProjects > 0 || currentProjects > 0) {
        projectGraph.innerHTML = ''; // Clear any existing content
        const barGraph = new BarGraph(projectData, {
          width: 600,
          height: 300,
          padding: 40,
          colors: ['#3e3eff', '#4caf50'],
        });
        const svgElement = barGraph.render();
        projectGraph.appendChild(svgElement);
      } else {
        projectGraph.innerHTML = '<p>No project data available</p>';
      }
    }

    // Update completed projects section
    const completedProjectsGrid = document.getElementById(
      'completedProjectsGrid'
    );
    if (completedProjectsGrid) {
      if (
        userData.completed_projects &&
        userData.completed_projects.length > 0
      ) {
        completedProjectsGrid.innerHTML = '';

        userData.completed_projects.forEach((project) => {
          const projectPath = project.group.path;
          const projectName = projectPath.split('/').pop(); // Get the last part of the path

          const projectCard = document.createElement('div');
          projectCard.className = 'project-card';
          projectCard.innerHTML = `
            <p>${formatProjectName(projectName)}</p>
          `;

          completedProjectsGrid.appendChild(projectCard);
        });
      } else {
        completedProjectsGrid.innerHTML = '<p>No completed projects found.</p>';
      }
    }

    // Update current projects section
    const currentProjectsGrid = document.getElementById('currentProjectsGrid');
    if (currentProjectsGrid) {
      if (userData.current_projects && userData.current_projects.length > 0) {
        currentProjectsGrid.innerHTML = '';

        userData.current_projects.forEach((project) => {
          const projectPath = project.group.path;
          const projectName = projectPath.split('/').pop(); // Get the last part of the path

          const projectCard = document.createElement('div');
          projectCard.className = 'project-card current-project';
          projectCard.innerHTML = `
            <p>${formatProjectName(projectName)}</p>
          `;

          currentProjectsGrid.appendChild(projectCard);
        });
      } else {
        currentProjectsGrid.innerHTML = '<p>No current projects found.</p>';
      }
    }

    // Update skills section
    const skillsGraph = document.getElementById('skillsGraph');
    if (skillsGraph) {
      if (userData.skills && userData.skills.length > 0) {
        const skillsData = userData.skills.map((skill) => {
          // Format skill type (remove "skill_" prefix and capitalize)
          const skillName =
            skill.type.replace('skill_', '').charAt(0).toUpperCase() +
            skill.type.replace('skill_', '').slice(1);

          return {
            status: skillName,
            count: skill.amount,
          };
        });

        // Sort skills by amount in descending order
        skillsData.sort((a, b) => b.count - a.count);

        // Use the enhanced BarGraph with options
        const barGraph = new BarGraph(skillsData, {
          width: 800,
          maxValue: 100,
          gridLines: [0, 50, 100],
          colors: ['#3e3eff', '#4b7bec', '#3867d6', '#4b6584'],
          height: 400,
          barSpacing: 20,
          padding: 60,
        });

        skillsGraph.innerHTML = '';
        skillsGraph.appendChild(barGraph.render());
      } else {
        skillsGraph.innerHTML = '<p>No skills data available</p>';
      }
    }
  } catch (error) {
    displayPopup(error.message || 'Error loading profile data', false);
    console.error('Error loading profile data:', error);
  }
}

function updateElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

function formatProjectName(name) {
  // Replace hyphens and underscores with spaces
  let formattedName = name.replace(/[-_]/g, ' ');

  // Capitalize each word
  formattedName = formattedName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return formattedName;
}
