// BLE service and characteristic UUIDs
const SERVICE_UUID = "a4e49a1e-d4b6-4385-b18d-81bd1a2cf4d7";
const CHARACTERISTIC_UUID = "ed01a752-e2ed-488f-b0a6-1f55ae5e6265";

// Object to maintain connection status for each BLE device
const bleStatus = {
    BLE_1: 'Disconnected',
    BLE_2: 'Disconnected',
    BLE_3: 'Disconnected',
    BLE_4: 'Disconnected',
    BLE_5: 'Disconnected'   
    
};

const gameStatus = {
    Football: 'Football',
    Wearable: 'Wearable'
    //Basketball: 'Basketball'
}

// Object to store connected BLE devices
const bleDevices = {};

// Function to connect to a BLE device
async function connectToDevice(bleName) {
    try {
        if (bleStatus[bleName] === 'Connected') {
            alert(`${bleName} is already connected.`);
            return;
        }

        console.log(`Requesting device with name: ${bleName}`);
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: bleName }],
            optionalServices: [SERVICE_UUID]
        });

        console.log(`Connecting to GATT server for ${bleName}`);
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        // Store the device and characteristic for future use
        bleDevices[bleName] = { device, characteristic };

        // Update the status and UI
        bleStatus[bleName] = 'Connected';
        updateStatus(bleName);

        // Handle device disconnect
        device.addEventListener('gattserverdisconnected', () => {
            bleStatus[bleName] = 'Disconnected';
            updateStatus(bleName);
            console.log(`${bleName} disconnected.`);
        });

        alert(`${bleName} connected successfully.`);
    } catch (error) {
        console.error(`Failed to connect to ${bleName}:`, error);
        alert(`Failed to connect to ${bleName}: ${error.message}`);
    }
}

// Function to disconnect from a BLE device
function disconnectDevice(bleName) {
    try {
        if (bleStatus[bleName] === 'Disconnected') {
            alert(`${bleName} is already disconnected.`);
            return;
        }

        const { device } = bleDevices[bleName];
        if (device && device.gatt.connected) {
            console.log(`Disconnecting from ${bleName}`);
            device.gatt.disconnect();
        }

        // Clean up
        delete bleDevices[bleName];
        bleStatus[bleName] = 'Disconnected';
        updateStatus(bleName);
        alert(`${bleName} disconnected successfully.`);
    } catch (error) {
        console.error(`Failed to disconnect from ${bleName}:`, error);
        alert(`Failed to disconnect from ${bleName}: ${error.message}`);
    }
}

// Function to update the status display
function updateStatus(bleName) {
    const statusElement = document.getElementById(`status_${bleName}`);
    statusElement.textContent = `Status: ${bleStatus[bleName]}`;
}

// Placeholder functions for number pad functionality
function sendNumber(number) {
    console.log(`Sending number: ${number}`);
    // Add functionality to write the number to the BLE characteristic
    for (const [name, { characteristic }] of Object.entries(bleDevices)) {
        if (bleStatus[name] === 'Connected') {
            const data = new TextEncoder().encode(number.toString());
            characteristic.writeValue(data).then(() => {
                console.log(`Number ${number} sent to ${name}`);
            }).catch(error => {
                console.error(`Failed to send number to ${name}:`, error);
            });
        }
    }
}

function sendRandomNumber() {
    const randomNum = Math.floor(Math.random() * 10);
    console.log(`Sending random number: ${randomNum}`);
    sendNumber(randomNum);
}


function updateStatusGame(Game) {
    //const statusElement = document.getElementById(`status_${Game}`);
    statusElement.textContent = `Selected Game: ${gameStatus[Game]}`;
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("gameStatus").textContent = "Wearable";
});

function sendMessageToAll(message, game) {
    console.log(`Sending message: ${message}`);

    // Update the game status
    let statusElement = document.getElementById("gameStatus");
    if (statusElement) {
        statusElement.textContent = game;
    }

    const data = new TextEncoder().encode(message);

    for (const [name, { characteristic }] of Object.entries(bleDevices)) {
        if (bleStatus[name] === 'Connected') {
            characteristic.writeValue(data)
                .then(() => console.log(`Message "${message}" sent to ${name}`))
                .catch(error => console.error(`Failed to send message to ${name}:`, error));
        }
    }
}
