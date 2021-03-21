import { jitsiConfiguration } from '../configs/jitsiConnectionConfig';
import $ from 'jquery';
// @ts-ignore
import JitsiMeet from 'lib-jitsi-meet-dist';
import { JitsiConference, JitsiTrack } from "@aktriver/types-lib-jitsi-meet";
// @ts-ignore
window.$ = $;

const confOptions = {
    openBridgeChannel: true
};

class JitsiController {
    jitsiConnection?: any;
    onConnectionEstablished?: any;
    onConnectionFailed?: any;
    onConnectionDisconnected?: any;
    onLocalTracksAvailable?: (tracks: JitsiTrack[]) => void;
    onRemoteTrack?: (track: JitsiTrack) => void;
    onConferenceJoined?: () => void;
    onTrackRemoved?: (track: JitsiTrack) => void;
    onUserJoined?: (id: string) => void;
    onUserLeft?: (id: string) => void;
    room: JitsiConference | null;
    localTracks: JitsiTrack[];
    remoteTracks: {
        [id: string]: JitsiTrack[]
    }
    constructor() {
        this.jitsiConnection = null;
    }

    initConference = ({
          roomName,
          onConnectionEstablished,
          onConnectionFailed,
          onConnectionDisconnected,
          onLocalTracksAvailable,
          onRemoteTrack,
          onConferenceJoined,
          onTrackRemoved,
          onUserJoined,
          onUserLeft
    }) => {
        this.onConnectionEstablished = onConnectionEstablished;
        this.onConnectionFailed = onConnectionFailed;
        this.onConnectionDisconnected = onConnectionDisconnected;
        this.onLocalTracksAvailable = onLocalTracksAvailable;
        this.onRemoteTrack = onRemoteTrack;
        this.onConferenceJoined = onConferenceJoined;
        this.onTrackRemoved = onTrackRemoved;
        this.onUserJoined = onUserJoined;
        this.onUserLeft = onUserLeft;
        this.remoteTracks = {};

        JitsiMeet.init({
            disableThirdPartyRequests: true,
            preferredCodec: 'VP8'
        });

        const connectionConfig = { ...jitsiConfiguration };

        let serviceUrl = connectionConfig.websocket || connectionConfig.bosh;

        serviceUrl += `?room=${roomName}`;

        connectionConfig.serviceUrl = connectionConfig.bosh = serviceUrl;
        this.jitsiConnection = new JitsiMeet.JitsiConnection(null, null, connectionConfig);

        this.jitsiConnection.addEventListener(
            JitsiMeet.events.connection.CONNECTION_ESTABLISHED,
            this.onConnectionEstablished
        );

        this.jitsiConnection.addEventListener(
            JitsiMeet.events.connection.CONNECTION_FAILED,
            this.onConnectionFailed
        );

        this.jitsiConnection.addEventListener(
            JitsiMeet.events.connection.CONNECTION_DISCONNECTED,
            this.onConnectionDisconnected
        );

        console.log('JitsiMeet.events');
        console.log(JitsiMeet.events);
    }

    establishConnection = async () => {
        try {
            const tracks: JitsiTrack[] = await JitsiMeet.createLocalTracks({ devices: [ 'audio', 'video' ] });

            this.localTracks = tracks;

            this.onLocalTracksAvailable(tracks);

            this.addLocalTrackEventListeners(tracks);

            this.jitsiConnection.connect();
        } catch (e) {
            console.log(e.message)
        }
    }

    getMediaDevices = async () => {
        return new Promise(resolve => {
            JitsiMeet.mediaDevices.enumerateDevices(devices => {
                resolve(devices);
            });
        })
    }

    addLocalTrackEventListeners = (tracks) => {
        for (let i = 0; i < tracks.length; i++) {
            tracks[i].addEventListener(
                JitsiMeet.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                audioLevel => {
                    // console.log(`Audio Level local: ${audioLevel}`)
                });

            tracks[i].addEventListener(
                JitsiMeet.events.track.TRACK_MUTE_CHANGED,
                () => console.log('local track muted'));

            tracks[i].addEventListener(
                JitsiMeet.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('local track stopped'));

            tracks[i].addEventListener(
                JitsiMeet.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
                deviceId => console.log(`track audio output device was changed to ${deviceId}`));
        }
    }

    joinRoom = () => {
        this.room = this.jitsiConnection.initJitsiConference('conference', confOptions);
        this.room.on(JitsiMeet.events.conference.TRACK_ADDED, (track) => {
            const participant = track.getParticipantId();
            if (!track.isLocal()) {
                if (this.remoteTracks[participant]) {
                    const trackId = track.getId();
                    if (!this.remoteTracks[participant].find(track => track.getId() === trackId)) {
                        this.remoteTracks[participant].push(track);
                        this.onRemoteTrack(track);
                    }
                } else {
                    this.remoteTracks[participant] = [track];
                    this.onRemoteTrack(track);
                }
                track.addEventListener(
                    JitsiMeet.events.track.TRACK_AUDIO_LEVEL_CHANGED,
                    audioLevel => {
                        // console.log(`Audio Level remote: ${audioLevel}`)
                    });

                track.addEventListener(
                    JitsiMeet.events.track.TRACK_MUTE_CHANGED,
                    () => console.log('remote track muted'));

                track.addEventListener(
                    JitsiMeet.events.track.LOCAL_TRACK_STOPPED,
                    () => console.log('remote track stopped'));
            }
        });

        this.room.on(JitsiMeet.events.conference.TRACK_REMOVED, track => {
            const participant = track.getParticipantId();

            if (!track.isLocal()) {
                if (this.remoteTracks[participant]) {
                    const trackId = track.getId();
                    if (!this.remoteTracks[participant].filter(track => track.getId() === trackId)) {
                        this.remoteTracks[participant].push(track);
                        this.onRemoteTrack(track);
                    }
                }
            }

            this.onTrackRemoved(track);
        });

        this.room.on(
            JitsiMeet.events.conference.CONFERENCE_JOINED,
            this.onConferenceJoined);

        this.room.on(JitsiMeet.events.conference.USER_JOINED, (id: string) => {
            console.log('user join', id);
            this.onUserJoined(id);
        });

        this.room.on(JitsiMeet.events.conference.USER_LEFT, (id) => {
            console.log(`User left - ${id}`)
            this.onUserLeft(id);
        });

        this.room.on(JitsiMeet.events.conference.TRACK_MUTE_CHANGED, track => {
            console.log(`${track.getType()} - ${track.isMuted()}`);
        });

        this.room.on(
            JitsiMeet.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
            (userID, audioLevel) => {
                // console.log(`${userID} - ${audioLevel}`)
            });

        this.room.join();
    }
    addTracks = async () => {
        this.localTracks.forEach(track => {
            this.room.addTrack(track);
        });
    }
}

JitsiMeet.setLogLevel(JitsiMeet.logLevels.ERROR);

const JitsiControllerInstance = new JitsiController();

export {
    JitsiControllerInstance
}

