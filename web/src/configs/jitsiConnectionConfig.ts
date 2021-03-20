const jitsiConfiguration = {
    analytics: {},
    bosh: "/http-bind",
    channelLastN: -1,
    // clientNode: "http://jitsi.org/jitsimeet",
    constraints: {
        video: {
            height: { ideal: 100, max: 100, min: 100 },
            width: { ideal: 180, max: 180, min: 180 }
        }
    },
    openBridgeChannel: 'websocket',
    deploymentInfo: {},
    disableAP: false,
    disableAudioLevels: false,
    disableSimulcast: false,
    enableCalendarIntegration: false,
    enableClosePage: false,
    enableLipSync: false,
    enableNoAudioDetection: false,
    enableNoisyMicDetection: true,
    enableRemb: true,
    enableStatsID: false,
    enableTalkWhileMuted: false,
    enableTcc: true,
    enableUserRolesBasedOnToken: false,
    enableWelcomePage: true,
    focusUserJid: "focus@auth.meet.jitsi",
    hosts: {
        domain: "meet.jitsi",
        muc: "muc.meet.jitsi"
    },
    makeJsonParserHappy: "even if last key had a trailing comma",
    p2p: {
        enabled: true,
        stunServers: [
            { urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" }
        ]
    },
    prejoinPageEnabled: false,
    requireDisplayName: false,
    resolution: 720,
    startAudioMuted: 10,
    startAudioOnly: false,
    startVideoMuted: 10,
    stereo: false,
    serviceUrl: '',
    testing: {
        capScreenshareBitrate: 1,
        octo: {
            probability: 0
        },
        p2pTestMode: false,
    },
    transcribingEnabled: false,
    useIPv6: true,
    websocket: "wss://13.52.206.105/xmpp-websocket",
};

export {
    jitsiConfiguration
};