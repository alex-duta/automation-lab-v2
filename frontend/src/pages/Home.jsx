import { useEffect } from "react";
import WidgetCard from "../components/WidgetCard";

// Home page displaying available widgets for automation
export default function Home() {
  useEffect(() => {
    document.title = "Automation Playground";
  }, []);

  // Render the home page with widget cards
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Automation Playground</h1>
      <p style={styles.subtitle}>Select a widget to get started</p>

      <div style={styles.grid}>
        <WidgetCard
          title="Create User"
          description="Create a new user with role, status, and profile picture."
          link="/create-user"
          features={["Input fields", "Buttons", "File upload", "Dropdowns", "Validation messages",
            "Loading delay (message display for user creation)", "Locators: ID, Name, Text, Xpath, CSS"]}
        />

        <WidgetCard
          title="List All Users"
          description="View all users, search, filter by role/status, and paginate."
          link="/users"
          features={["Table", "Search", "AJAX Data fetching", "Filters", "Pagination",
            "Dynamic ID handling for table rows"
          ]}
        />

        <WidgetCard
          title="Get Random Users"
          description="Get random user names using dialogs."
          link="/user-dialogs"
          features={["Alert dialog", "Confirm dialog", "Prompt dialog"]}
        />

        <WidgetCard
          title="Get User"
          description="Get random user names with overlapping elements and scrollable content."
          link="/user-search-overlap"
          features={["Overlapping elements", "Scrollable results"]}
        />

        <WidgetCard
          title="Edit User"
          description="Edit the permissions, notifications, language and bio of a user."
          link="/edit-user"
          features={["Check boxes", "Radio buttons", "Keys (Enter, Ctrl+A)", "Rich text editor in an iframe",
            "Browser form validation", "Options whose value differs from their text", "User kept in the URL"]}
        />

        <WidgetCard
          title="Team Board"
          description="Move users between teams and rename the teams."
          link="/team-board"
          features={["Drag and drop (HTML5)", "Details on hover", "Double-click to rename", "Right-click menu",
            "Web components with shadow DOM", "Browser storage (highlights)"]}
        />

        <WidgetCard
          title="Export & Reports"
          description="Download the users as CSV and generate reports."
          link="/user-reports"
          features={["File download (CSV)", "Report whose status changes over time", "Text and attributes to wait for",
            "Printable view in a new tab", "Page title and URL"]}
        />

        <WidgetCard
          title="Session & Preferences"
          description="Sign in as a user and choose their theme and date format."
          link="/account"
          features={["HTTP-only session cookie", "Preferences of the signed-in user", "E-mail remembered in a cookie",
            "Tabs in the browser history (back, forward)", "Reload keeps the state", "Theme as an attribute"]}
        />

        {/* Add more widgets here if needed */}
      </div>
    </div>
  );
}

// Styles for the Home component
const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#555",
    marginBottom: "40px",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",           // allows multiple rows if screen is small
    justifyContent: "center",   // center widgets horizontally
    gap: "30px",                // space between widgets
    maxWidth: "1140px",         // at most four widgets per row; the next ones go to a new row
    margin: "0 auto",
  },
};
