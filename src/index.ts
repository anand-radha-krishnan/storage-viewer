export function displayStorageTabs(): void {
  const container = document.createElement("div");
  container.style.fontFamily = "Arial, sans-serif";
  container.style.margin = "20px";

  // Create a tab navigation
  const tabNav = document.createElement("div");
  tabNav.style.display = "flex";
  tabNav.style.justifyContent = "space-around";
  tabNav.style.cursor = "pointer";
  tabNav.style.borderBottom = "2px solid #ccc";

  const tabsContent: Record<string, HTMLElement> = {};

  ["Cookies", "Local Storage", "Session Storage"].forEach((tabName) => {
    const tabButton = document.createElement("button");
    tabButton.textContent = tabName;
    tabButton.style.flexGrow = "1";
    tabButton.style.padding = "10px";
    tabButton.style.border = "none";
    tabButton.style.backgroundColor = "#f1f1f1";
    tabButton.style.fontWeight = "bold";

    const tabContent = document.createElement("div");
    tabContent.style.display = "none"; // Initially hidden
    tabsContent[tabName] = tabContent;

    tabButton.addEventListener("click", () => {
      Object.keys(tabsContent).forEach((key) => {
        tabsContent[key].style.display = key === tabName ? "block" : "none";
      });
      Array.from(tabNav.children).forEach((btn) => {
        (btn as HTMLElement).style.backgroundColor =
          btn === tabButton ? "#ddd" : "#f1f1f1";
      });
    });

    tabNav.appendChild(tabButton);
    container.appendChild(tabContent);
  });

  // Cookies Tab
  populateEditableTable(
    tabsContent["Cookies"],
    getCookies(),
    "Cookies",
    saveCookies
  );

  // Local Storage Tab
  populateEditableTable(
    tabsContent["Local Storage"],
    getStorageData(localStorage),
    "Local Storage",
    (data) => saveStorageData(localStorage, data)
  );

  // Session Storage Tab
  populateEditableTable(
    tabsContent["Session Storage"],
    getStorageData(sessionStorage),
    "Session Storage",
    (data) => saveStorageData(sessionStorage, data)
  );

  tabsContent["Cookies"].style.display = "block"; // Default active tab
  container.insertBefore(tabNav, container.firstChild);
  document.body.appendChild(container);
}

function populateEditableTable(
  container: HTMLElement,
  data: Record<string, string>,
  storageType: string,
  saveCallback: (data: Record<string, string>) => void
): void {
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  const headerRow = table.insertRow();
  ["Key", "Value"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.border = "1px solid black";
    th.style.padding = "5px";
    th.style.backgroundColor = "#ddd";
    headerRow.appendChild(th);
  });

  Object.entries(data).forEach(([key, value]) => {
    const row = table.insertRow();
    [key, value].forEach((text, index) => {
      const cell = row.insertCell();
      cell.textContent = text;
      cell.dataset.originalValue = text; // Store original value for comparison
      cell.contentEditable = index === 1 ? "true" : "false"; // Only allow editing of the Value column
      cell.style.border = "1px solid black";
      cell.style.padding = "5px";

      // Highlight edited cells when content changes
      if (index === 1) {
        cell.addEventListener("input", () => {
          if (cell.textContent !== cell.dataset.originalValue) {
            cell.style.backgroundColor = "#ffff99"; // Highlight changed cells
          } else {
            cell.style.backgroundColor = ""; // Reset background color if reverted
          }
        });
      }
    });
  });

  container.innerHTML = `<h2>${storageType}</h2>`;
  container.appendChild(table);

  const saveButton = document.createElement("button");
  saveButton.textContent = `Save ${storageType} Changes`;
  saveButton.style.marginTop = "10px";

  saveButton.addEventListener("click", () => {
    const updatedData: Record<string, string> = {};
    const rows = table.rows;
    let hasChanges = false;

    for (let i = 1; i < rows.length; i++) {
      // Start from 1 to skip header
      const keyCell = rows[i].cells[0];
      const valueCell = rows[i].cells[1];
      const key = keyCell.textContent || "";
      const value = valueCell.textContent || "";

      if (value !== valueCell.dataset.originalValue) {
        updatedData[key] = value;
        hasChanges = true;
        valueCell.dataset.originalValue = value; // Update the original value
        valueCell.style.backgroundColor = ""; // Reset background color
      }
    }

    if (hasChanges) {
      saveCallback(updatedData);
      alert(`Changes saved to ${storageType}`);
    } else {
      alert("No changes to save");
    }
  });
  container.appendChild(saveButton);
}

function getStorageData(storage: Storage): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      data[key] = storage.getItem(key) || "";
    }
  }
  return data;
}

function saveStorageData(storage: Storage, data: Record<string, string>): void {
  Object.entries(data).forEach(([key, value]) => {
    if (value === "") {
      // If the value is empty, remove the key from storage
      storage.removeItem(key);
    } else {
      // Otherwise, update or add the key-value pair
      storage.setItem(key, value);
    }
  });
}

function getCookies(): Record<string, string> {
  return document.cookie
    .split(";")
    .reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.split("=").map((c) => c.trim());
      if (key) {
        acc[key] = decodeURIComponent(value || "");
      }
      return acc;
    }, {});
}

function saveCookies(data: Record<string, string>): void {
  Object.entries(data).forEach(([key, value]) => {
    if (value === "") {
      // To delete a cookie, set its expiration date to a past date
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    } else {
      // Update or add the cookie
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
    }
  });
}
