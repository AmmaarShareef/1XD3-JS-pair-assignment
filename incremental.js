let isGodMode = false;

let upgradeScroll = 0;
let upgradeAreaState = 0; //0 = ignore, 1 = page 1, 2 = page 2
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
            if (secretRewardActive) {
                console.log("here");
                rewardInfoText[6][2] = (upgrades[7][2] != 0) && (upgrades[11][2] != 0);
            }
        }
        updateUpgradePriceText(x);
        updateDisplayedNumber();
    }
}

function updateUpgradePriceText(x = -1) {
    if (x == -1) {
        for (let i = 0; i < 12; i++) {
            Ubuttons[i].querySelector("p").innerHTML = "Price: " + simplify(upgrades[i][0]);
        }
    } else {
        Ubuttons[x].querySelector("p").innerHTML = "Price: " + simplify(upgrades[x][0]);
    }
}

function simplify(x) {
    if (x < 1e6) {
        return String(x) + " Matter";
    } else if (x < 1e9) {
        return String(Math.floor(x / 1e3) / 1e3) + " Million Matter";
    } else if (x < 1e12) {
        return String(Math.floor(x / 1e6) / 1e3) + " Billion Matter";
    } else if(x < 1e15){
        return String(Math.floor(x / 1e9) / 1e3) + " Trillion Matter";
    } else if(x < 1e18){
        return String(Math.floor(x / 1e12) / 1e3) + " Quadrillion Matter";
    } else{
        return "Error."
    }
}




let numberOfMatter = 0;
let matterPerClick = 1;
let autoClick = 0;

let auto = null;
function updateAutoClick() {
    clearInterval(auto);
    if (autoClick > 0) {
        auto = setInterval(() => {
            handleClick(false);
        }, (isGodMode ? 1 : 1000) / Math.sqrt(autoClick));
    }

}

function handleClick(realClick) {
    totalClicks += (isGodMode ? 1000 : 1);
    numberOfClicks += realClick ? (isGodMode ? 1000 : 1) : 0;
    numberOfAutoMatter += realClick ? 0 : matterPerClick *(isGodMode ? 1000 : 1);
    numberOfMatter += matterPerClick * (isGodMode ? 1000 : 1);
    numberOfMatterTotal += matterPerClick * (isGodMode ? 1000 : 1);
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

function checkAchivements() {
    if (numberOfMatterTotal >= 1e6) {
        rewardInfoText[0][2] = true;
    }
    if (numberOfMatterTotal >= 1e9) {
        rewardInfoText[2][2] = true;
    }
    if (numberOfClicks >= 1000) {
        rewardInfoText[4][2] = true;
    }
    if(timePlayed >= 60) {
        rewardInfoText[3][2] = true;
    }
    if (upgrades[2][2] != 0) {
        rewardInfoText[1][2] = true;
    }
    if (numberOfMatterTotal >= 1e12) {
        rewardInfoText[5][2] = true;
    }
    secretRewardActive = rewardInfoText[0][2] && rewardInfoText[1][2] && rewardInfoText[2][2] && rewardInfoText[3][2] && rewardInfoText[4][2];
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
function setTimePlayedInterval() {
    clearInterval(timePlayedInterval);
    timePlayedInterval = setInterval(() => {
        timePlayed += 1;
    }, (isGodMode ? 60 : 60000));
    checkAchivements();
}


function notificationSystem(x) {

}

function activateGodMode(){
    isGodMode = true;
    setTimePlayedInterval();
}


