let isGodMode = false;

let upgradeScroll = 0;
let upgradeAreaState = 0; //0 = ignore, 1 = page 1, 2 = page 2

/**
 * Updates the upgrade panel's visibility, scroll position, and displayed page.
 *
 * @param {WheelEvent|null} [event=null] - The scroll wheel event used to adjust
 *   the upgrade scroll offset. Pass `null` to skip scroll adjustment.
 * @param {number} [state=-1] - The target state for the upgrade area:
 *   - `-1`: No state change; only scroll position is updated.
 *   - `0`: Hide the upgrade area (slides off-screen to the right).
 *   - `1`: Show page 1 of upgrades and reset scroll.
 *   - `2`: Show page 2 of upgrades and reset scroll.
 * @returns {void}
 */
function updateUpgradeArea(event = null, state = -1) {
    upgradeScroll += event ? (event.deltaY > 0 ? 1 : -1) : 0;
    upgradeArea.style.right = '0';
    switch (state) {
        case 0:
            upgradeAreaState = 0;
            upgradeArea.style.right = '-30%';
            break;
        case 1:
            upgradeAreaState = 1;
            upgradeScroll = 0;
            Upage1.style.display = "flex";
            Upage2.style.display = "none";
            break;
        case 2:
            upgradeAreaState = 2;
            upgradeScroll = 0;
            Upage1.style.display = "none";
            Upage2.style.display = "flex";
            break;
    }

    if (upgradeScroll < 0) {
        upgradeScroll = 0;
    }

    if (upgradeScroll > MAX_UPGRADE_SCROLL) {
        upgradeScroll = MAX_UPGRADE_SCROLL;
    }

    for (const button of Ubuttons) {
        button.style.transform = `translateY(-${upgradeScroll * ((Upage1.offsetHeight - window.innerHeight) / (MAX_UPGRADE_SCROLL - 3))}px)`;
    }
}

/**
 * Updates the main matter counter display with the current `numberOfMatter` value,
 * formatting it into the appropriate unit scale (Matter, Million, Billion, Trillion,
 * or Quadrillion) and adjusting font size as needed.
 *
 * @returns {void}
 */
function updateDisplayedNumber() {
    displayedUnits.style.fontSize = "30vh";
    displayedUnits.style.bottom = "-10%";
    switch (true) {
        case (numberOfMatter < 1e6):
            displayedNumber.innerHTML = numberOfMatter;
            displayedUnits.innerHTML = "Matter";
            break;
        case (numberOfMatter < 1e9):
            displayedNumber.innerHTML = dotZero(Math.round(numberOfMatter / 1e3));
            displayedUnits.innerHTML = "Million Matter";
            break;
        case (numberOfMatter < 1e12):
            displayedNumber.innerHTML = dotZero(Math.round(numberOfMatter / 1e6));
            displayedUnits.innerHTML = "Billion Matter";
            break;
        case (numberOfMatter < 1e15):
            displayedNumber.innerHTML = dotZero(Math.round(numberOfMatter / 1e9));
            displayedUnits.innerHTML = "Trillion Matter";
            break;
        default:
            displayedNumber.innerHTML = dotZero(Math.round(numberOfMatter / 1e12));
            displayedUnits.innerHTML = "Quadrillion Matter";
            displayedUnits.style.fontSize = "25vh";
            displayedUnits.style.bottom = "-5%";
            break;

    }
}

/**
 * Formats a number into a zero-padded decimal string with 3 decimal places,
 * dividing it by 1000. Used to display large matter counts with consistent
 * formatting (e.g. `5000` → `"5.000"`, `5100` → `"5.100"`).
 *
 * @param {number} x - The number to format. Expected to be a multiple of 10 or
 *   cleanly divisible for best results.
 * @returns {string} The formatted decimal string.
 */
function dotZero(x) {
    if (x % 1e3 == 0) {
        return (String(x / 1e3) + ".000");
    } else if (x % 1e2 == 0) {
        return (String(x / 1e3) + "00");
    } else if (x % 10 == 0) {
        return (String(x / 1e3) + "0");
    } else {
        return (String(x / 1e3));
    }
}

let upgrades = [
    [10, 1, 0],
    [100, 5, 0],
    [500, 50, 0],
    [10000, 200, 0],
    [900000, 800, 0],
    [4e7, 3000, 0],
    [1e9, 10000, 0],
    [666666666666, 666666, 0], // <- 8th

    [100, 1, 0],
    [1e5, 50, 0],
    [1e8, 2000, 0],
    [333333333333, 333333, 0]

]

/**
 * Attempts to purchase the upgrade at the given index.
 *
 * If the player has enough matter, deducts the cost, applies the upgrade's bonus
 * (either `matterPerClick` for click upgrades 0–7, or `autoClick` for auto upgrades
 * 8–11), increments the owned count, and scales the next purchase price. Also checks
 * for achievement unlocks and triggers a secret reward notification if both the
 * Worm Hole (index 7) and Space God (index 11) have been purchased at least once.
 *
 * @param {number} x - The index of the upgrade to purchase (0–11).
 * @returns {void}
 */
function buyUpgrade(x) {
    if (numberOfMatter >= upgrades[x][0]) {

        if (x > 7) {
            autoClick += upgrades[x][1];
            updateAutoClick();
        } else {
            matterPerClick += upgrades[x][1];
        }
        numberOfMatter -= upgrades[x][0];
        upgrades[x][2] += 1;
        upgrades[x][0] = Math.round(upgrades[x][0] * (1.13 + 0.05 * upgrades[x][2]));
        checkAchivements();
        if (x == 7 || x == 11) {
            if (!rewardInfoText[6][2] && secretRewardActive) {
                if ((upgrades[7][2] != 0) && (upgrades[11][2] != 0)) {
                    rewardInfoText[6][2] = true;
                    notificationSystem(rewardInfoText[6][0]);
                }
            }
        }
        updateUpgradePriceText(x);
        updateDisplayedNumber();
    }
}

/**
 * Updates the price text displayed on upgrade buttons.
 *
 * When called with no argument (or `-1`), refreshes all 12 upgrade button labels.
 * When called with a specific index, updates only that button.
 *
 * @param {number} [x=-1] - The index of the upgrade button to update (0–11),
 *   or `-1` to update all buttons.
 * @returns {void}
 */
function updateUpgradePriceText(x = -1) {
    if (x == -1) {
        for (let i = 0; i < 12; i++) {
            Ubuttons[i].querySelector("p").innerHTML = "Price: " + simplify(upgrades[i][0]);
        }
    } else {
        Ubuttons[x].querySelector("p").innerHTML = "Price: " + simplify(upgrades[x][0]);
    }
}

/**
 * Converts a raw matter amount into a human-readable string with an appropriate
 * unit suffix (Matter, Million, Billion, Trillion, or Quadrillion).
 *
 * @param {number} x - The matter amount to simplify.
 * @returns {string} A formatted string such as `"1.5 Billion Matter"`, or `"Error."`
 *   if the value is 1e18 or greater.
 */
function simplify(x) {
    if (x < 1e6) {
        return String(x) + " Matter";
    } else if (x < 1e9) {
        return String(Math.floor(x / 1e3) / 1e3) + " Million Matter";
    } else if (x < 1e12) {
        return String(Math.floor(x / 1e6) / 1e3) + " Billion Matter";
    } else if (x < 1e15) {
        return String(Math.floor(x / 1e9) / 1e3) + " Trillion Matter";
    } else if (x < 1e18) {
        return String(Math.floor(x / 1e12) / 1e3) + " Quadrillion Matter";
    } else {
        return "Error."
    }
}




let numberOfMatter = 0;
let matterPerClick = 1;
let autoClick = 0;

let auto = null;

/**
 * Restarts the auto-click interval based on the current `autoClick` value.
 *
 * Clears any existing interval, then sets a new one whose fire rate scales with
 * the square root of `autoClick`. In God Mode, the interval fires 1000× faster.
 * If `autoClick` is 0 or less, no interval is started.
 *
 * @returns {void}
 */
function updateAutoClick() {
    clearInterval(auto);
    if (autoClick > 0) {
        auto = setInterval(() => {
            handleClick(false);
        }, (isGodMode ? 1 : 1000) / Math.sqrt(autoClick));
    }

}

/**
 * Processes a single click event (either manual or automated).
 *
 * Increments total click counters and matter values. In God Mode, all values are
 * multiplied by 1000. Also checks for the 1 Trillion matter achievement and triggers
 * an achievement check on every call.
 *
 * @param {boolean} realClick - `true` if triggered by a real player click;
 *   `false` if triggered by the auto-click interval. Determines which counters
 *   are incremented (`numberOfClicks` vs `numberOfAutoMatter`).
 * @returns {void}
 */
function handleClick(realClick) {
    totalClicks += (isGodMode ? 1000 : 1);
    numberOfClicks += realClick ? (isGodMode ? 1000 : 1) : 0;
    numberOfAutoMatter += realClick ? 0 : matterPerClick * (isGodMode ? 1000 : 1);
    numberOfMatter += matterPerClick * (isGodMode ? 1000 : 1);
    numberOfMatterTotal += matterPerClick * (isGodMode ? 1000 : 1);
    if(!rewardInfoText[5][2] && numberOfMatterTotal >= 1e12){
        rewardInfoText[5][2] = true;
        notificationSystem(rewardInfoText[5][0]);
    }
    checkAchivements();
    updateDisplayedNumber();
}


let numberOfClicks = 0;
let totalClicks = 0;
let numberOfMatterTotal = 0;
let timePlayed = 0;
let numberOfAutoMatter = 0;


let secretRewardActive = false;
let rewardInfoText = [
    ["First Million Matter", "Gather a total of 1 MILLION matter.", false],
    ["One leap for mankind", "Buy your first ASTEROID MINER.", false],
    ["Billionaire!", "Gather a total of 1 BILLION matter.", false],
    ["True Fan", "Play for 1 hour straight.", false],
    ["Broken fingers", "Click a total of 1000 times.", false],
    ["I MATTER!!!", "Gather a total of 1 TRILLION matter.", false],
    ["GODS!!!", "Buy both the SPACE GOD and WORM HOLE.", false],
    ["???", "???", false]
]

/**
 * Checks all achievement conditions and unlocks any that have been met.
 *
 * Evaluates thresholds for total matter gathered, total clicks, time played, and
 * specific upgrade purchases. Triggers a notification for each newly unlocked
 * achievement. Also determines whether the secret reward should become active
 * (requires the first 5 achievements to be unlocked), and if so, reveals the
 * secret reward area and sends a notification.
 *
 * Returns early without checking if `secretRewardActive` is already `true`.
 *
 * @returns {void}
 */
function checkAchivements() {
    if (secretRewardActive) {return }
    if (!rewardInfoText[0][2] && numberOfMatterTotal >= 1e6) {
        rewardInfoText[0][2] = true;
        notificationSystem(rewardInfoText[0][0]);
    }
    if (!rewardInfoText[2][2] && numberOfMatterTotal >= 1e9) {
        rewardInfoText[2][2] = true;
        notificationSystem(rewardInfoText[2][0]);
    }
    if (!rewardInfoText[4][2] && numberOfClicks >= 1000) {
        rewardInfoText[4][2] = true;
        notificationSystem(rewardInfoText[4][0]);
    }
    if (!rewardInfoText[3][2] && timePlayed >= 60) {
        rewardInfoText[3][2] = true;
        notificationSystem(rewardInfoText[3][0]);
    }
    if (!rewardInfoText[1][2] && upgrades[2][2] != 0) {
        rewardInfoText[1][2] = true;
        notificationSystem(rewardInfoText[1][0]);
    }
    if (!rewardInfoText[5][2] && numberOfMatterTotal >= 1e12) {
        rewardInfoText[5][2] = true;
        notificationSystem(rewardInfoText[5][0]);
    }
    secretRewardActive = rewardInfoText[0][2] && rewardInfoText[1][2] && rewardInfoText[2][2] && rewardInfoText[3][2] && rewardInfoText[4][2];
    if (secretRewardActive) {
        secretRewardArea.style.visibility = "visible";
        notificationSystem("Secrets Active!");
    }
}

let upgradeInfoText = [
    ["Claw Arm", "The first step to any automation in the universe.<br>+1 Matter/Click"],
    ["Drill Arm", "A Claw arm but with a... drill?<br>+5 Matter/Click"],
    ["Asteroid Miner", "To harvest the vast amounts of small pebbles in space.<br>+50 Matter/Click"],
    ["Planet Miner", "Try not to destroy every world while you are at it.<br>+200 Matter/Click"],
    ["Dyson Sphere", "The skies grow dark for the last time...<br>+800 Matter/Click"],
    ["Atom Splitter", "Splitting atoms in 2 since 2077.<br>+3000 Matter/Click"],
    ["Black Hole", "No one has ever come back from there.<br>+10000 Matter/Click"],
    ["Worm Hole", "I wonder whats on the other side. A new world?<br>+666666 Matter/Click"],
    ["Martians", "Who said they only have 2 hands?<br>+1 Auto Click Speed"],
    ["Space Port", "Transdimensional shipping when?<br>+50 Auto Click Speed"],
    ["Galactic Market", "Tariff free!<br>+2000 Auto Click Speed"],
    ["Space God", "Exudes a terrifying aura that materializes objects.<br>+333333 Auto Click Speed"]
]

/**
 * Shows or hides an upgrade or reward info tooltip panel.
 *
 * When `x` is `0`, the panel is hidden. Otherwise, the panel is populated with
 * the name, description, and owned/obtained count for the item at index `y`,
 * then positioned near the bounding rect `z`. Upgrade tooltips are anchored to
 * the left of the element; reward tooltips to the right. The panel is also
 * clamped vertically to stay within the viewport.
 *
 * @param {number} x - `0` to hide the panel, any other value to show it.
 * @param {number|null} [y=null] - Index into `upgradeInfoText` or `rewardInfoText`.
 * @param {DOMRect|null} [z=null] - Bounding rect of the triggering element, used
 *   to position the tooltip.
 * @param {boolean} [isUpgrade=false] - `true` to target the upgrade info panel;
 *   `false` to target the reward info panel.
 * @returns {void}
 */
function updateInfo(x, y = null, z = null, isUpgrade = false) {
    if (x == 0) {
        (isUpgrade ? upgradeInfo : rewardInfo).style.display = "none";
    } else {
        (isUpgrade ? upgradeInfo : rewardInfo).style.display = "initial";
        (isUpgrade ? upgradeInfo : rewardInfo).getElementsByTagName("h2")[0].innerHTML = (isUpgrade ? upgradeInfoText : rewardInfoText)[y][0];
        (isUpgrade ? upgradeInfo : rewardInfo).getElementsByTagName("p")[0].innerHTML = (isUpgrade ? upgradeInfoText : rewardInfoText)[y][1] + (isUpgrade ? "<br><br>Owned: " + String(upgrades[y][2]) : "<br><br>Obtained: " + String(rewardInfoText[y][2]));
        (isUpgrade ? upgradeInfo : rewardInfo).style.top = z.top + "px";
        (isUpgrade ? upgradeInfo.style.left = z.left - upgradeInfo.getBoundingClientRect().width + "px" : rewardInfo.style.left = z.right + "px");
        if (z.top > (window.innerHeight - (isUpgrade ? upgradeInfo : rewardInfo).offsetHeight)) {
            (isUpgrade ? upgradeInfo : rewardInfo).style.top = window.innerHeight - (isUpgrade ? upgradeInfo : rewardInfo).offsetHeight + "px";
        }
    }
}

/**
 * Refreshes the statistics panel with the latest game values.
 *
 * Updates all stat display fields (total matter, matter per click, matter spent,
 * current matter, time played, total clicks, and auto matter). When called with
 * `x` set to `false` (the default), also toggles the stat area panel's visibility
 * and hides the dev and help panels.
 *
 * This function is also called automatically on a 1-second interval to keep
 * displayed stats current.
 *
 * @param {boolean} [x=false] - If `true`, only refreshes the stat values without
 *   toggling panel visibility. If `false`, also toggles the stat area open/closed.
 * @returns {void}
 */
function updateStatArea(x = false) {
    statData[0].firstElementChild.value = simplify(numberOfMatterTotal);
    statData[1].firstElementChild.value = simplify(matterPerClick);
    statData[2].firstElementChild.value = simplify(numberOfMatterTotal - numberOfMatter);
    statData[3].firstElementChild.value = simplify(numberOfMatter);
    statData[4].firstElementChild.value = timePlayed;
    statData[5].firstElementChild.value = numberOfClicks;
    statData[6].firstElementChild.value = simplify(numberOfAutoMatter);
    if (x) {return;}
    devPanel.style.visibility = "hidden";
    helpPanel.style.visibility = "hidden";
    if (sC1.style.display == "none") {
        sC1.style.display = "initial";
        statArea.style.top = "20%";
    } else {
        sC1.style.display = "none";
        statArea.style.top = "-60%";
    }
}

setInterval(() => {
    updateStatArea(true);
}, 1000);

let timePlayedInterval = null;

/**
 * Restarts the time-played interval, incrementing `timePlayed` by 1 each tick.
 *
 * Clears any existing interval before starting a new one. In God Mode, the tick
 * fires every millisecond (effectively 60,000× faster) to simulate 1 minute per
 * real millisecond. Also triggers an achievement check after restarting.
 *
 * @returns {void}
 */
function setTimePlayedInterval() {
    clearInterval(timePlayedInterval);
    timePlayedInterval = setInterval(() => {
        timePlayed += 1;
    }, (isGodMode ? 60 : 60000));
    checkAchivements();
}


/**
 * Displays a temporary notification message on screen.
 *
 * Clones the notification template element, sets its text to `x`, appends it to
 * the notification area, then fades it out and removes it after 10 seconds.
 *
 * @param {string} x - The message text to display in the notification.
 * @returns {void}
 */
function notificationSystem(x) {
    const clone = notificationTemplate.cloneNode(true);
    clone.removeAttribute("id");
    clone.style.display = "initial";
    clone.querySelector("h2").innerHTML = x;
    notificationArea.appendChild(clone);
    setTimeout(() => {
        clone.style.opacity = 0;
        setTimeout(() => {
            clone.remove();
        }, 500);
    }, 10000);
}

/**
 * Activates God Mode for the current session.
 *
 * Sets `isGodMode` to `true`, displays a notification, and restarts the
 * time-played interval at the accelerated God Mode rate. God Mode multiplies
 * all click values by 1000 and greatly speeds up auto-click and time tracking.
 *
 * @returns {void}
 */
function activateGodMode() {
    isGodMode = true;
    notificationSystem("GodMode_Initialized!");
    setTimePlayedInterval();
}

/**
 * Resets all game state back to its initial values.
 *
 * Clears all matter, click, and time counters; resets upgrade costs and ownership
 * counts to their starting values; clears all achievement flags; disables God Mode;
 * stops the auto-click interval; and hides the secret reward area. Finishes by
 * refreshing the display, upgrade prices, auto-click interval, and time interval,
 * and shows a reset notification.
 *
 * @returns {void}
 */
function resetGame() {

    numberOfMatter = 0;
    numberOfMatterTotal = 0;
    matterPerClick = 1;
    autoClick = 0;

    numberOfClicks = 0;
    totalClicks = 0;
    numberOfAutoMatter = 0;
    timePlayed = 0;

    isGodMode = false;
    clearInterval(auto);

    for (let i = 0; i < upgrades.length; i++) {
        upgrades[i][2] = 0;
    }

    upgrades = [
        [10, 1, 0],
        [100, 5, 0],
        [500, 50, 0],
        [10000, 200, 0],
        [900000, 800, 0],
        [4e7, 3000, 0],
        [1e9, 10000, 0],
        [666666666666, 666666, 0],

        [100, 1, 0],
        [1e5, 50, 0],
        [1e8, 2000, 0],
        [333333333333, 333333, 0]
    ];

    for (let i = 0; i < rewardInfoText.length; i++) {
        rewardInfoText[i][2] = false;
    }

    secretRewardActive = false;
    secretRewardArea.style.visibility = "hidden";

    notificationSystem("Reset game!");
    updateDisplayedNumber();
    updateUpgradePriceText();
    updateAutoClick();
    setTimePlayedInterval();
}

/**
 * Adds a specified amount of matter to the player's current and total matter counts.
 *
 * Parses `x` as an integer before applying it. Used by the developer panel to
 * inject matter directly. Updates the displayed matter counter after adding.
 *
 * @param {string|number} x - The amount of matter to add. Will be parsed as an integer.
 * @returns {void}
 */
function addMatter(x) {
    x = parseInt(x)
    numberOfMatter += x;
    numberOfMatterTotal += x;
    updateDisplayedNumber();
}

/**
 * Handles the "Coming Soon" button interaction in the secret reward area.
 *
 * If the secret rewards are active and the final reward (index 7) has not yet been
 * triggered, marks it as obtained, updates its display text to "The End." / "Thanks
 * for playing!", and sends a "Coming Soon!" notification.
 *
 * @returns {void}
 */
function comingSoon() {
    if (!rewardInfoText[7][2] && secretRewardActive) {
        rewardInfoText[7][2] = true;
        rewardInfoText[7][1] = "Thanks for playing!"
        rewardInfoText[7][0] = "The End."
        notificationSystem("Coming Soon!");
    }
}