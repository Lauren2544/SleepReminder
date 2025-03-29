function scheduleAlarm() {
  let now = new Date();
  let nextSunday = new Date();

  // Calculate days until next Sunday
  let daysUntilSunday = (7 - now.getDay()) % 7;
  if (daysUntilSunday === 0 && now.getHours() >= 22) {
    // If today is Sunday and it's already past 10 PM, schedule for next Sunday
    daysUntilSunday = 7;
  }

  // set date and time for next sunday
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(22, 0, 0, 0); // Set time to 10 PM

  // testing alarm functionality works - set alarm for one min from current time
  // nextSunday.setDate(now.getDate());
  // nextSunday.setHours(now.getHours());
  // nextSunday.setMinutes(now.getMinutes() + 1);

  console.log("Next alarm scheduled for:", nextSunday);

  chrome.alarms.create("sleepReminder", {
    when: nextSunday.getTime(), // Set alarm for next Sunday at 10 PM
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to create a tab, wait, and remove it
async function createAndRemoveTab(url, waitTime) {
  chrome.tabs.create({ url: url });
  await wait(waitTime);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.remove(tabs[0].id);
    }
  });
}


async function createTabsWithDelays() {
  // Creating and removing the first tab
  await createAndRemoveTab("https://www.google.com/search?q=cartoon+3", 1000 * 4);
    
  // Wait for 30 seconds before creating and removing the second tab
  await wait(1000 * 30);
  await createAndRemoveTab("https://www.google.com/search?q=cartoon+2", 1000 * 4);
  
  // Wait for another 30 seconds before creating and removing the third tab
  await wait(1000 * 30);
  await createAndRemoveTab("https://www.google.com/search?q=cartoon+1", 1000 * 4);
  
  // Close current tab 
  await wait(1000 * 30);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.remove(tabs[0].id);
    }
  });

  // Schedule the next Sunday alarm
  scheduleAlarm();
}

// Listener for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sleepReminder") {
    // Send a notification
    createTabsWithDelays();
  }
});

// Set up the alarm when the extension is installed or updated
chrome.runtime.onInstalled.addListener(scheduleAlarm);
