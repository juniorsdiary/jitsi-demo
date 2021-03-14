import React, { useState, useEffect } from 'react';
import { JitsiControllerInstance } from './controllers/JitsiController';
import { UserVideo } from './components/UserVideo';
import { UserAudio } from './components/UserAudio';
import { JitsiTrack } from '@aktriver/types-lib-jitsi-meet';

function App() {
    const [usersData, setUsersData] = useState<any[]>([]);

    const handleLocalTracks = (tracks: JitsiTrack[]) => {
        const videoTrack = tracks.find(track => track.getType() === 'video');
        const audioTrack = tracks.find(track => track.getType() === 'audio');

        const userId = videoTrack.getParticipantId();

        setUsersData(prev => {
            const existedUser = prev.find(user => user.userId === userId);

            if (existedUser) {
                return prev.map(user => user.userId === userId ? ({ ...user, videoTrack, audioTrack }) : user);
            }

            return [ ...prev, { userId, videoTrack, audioTrack }];
        })
    }

    const handleRemoteTracks = (track) => {
        const typeTrack = track.getType();
        const userId = track.getParticipantId();

        setUsersData(prev => {
            const existedUser = prev.find(user => user.userId === userId);

            if (existedUser) {
                return prev.map(user => user.userId === userId ? ({ ...user, [`${typeTrack}Track`]: track }) : user);
            }

            return [ ...prev, { userId, [`${typeTrack}Track`]: track }];
        })
    }

    const handleConferenceJoined = async () => await JitsiControllerInstance.addTracks();

    const handleTrackRemoved = (track) => {
        setUsersData(prev => {
            const userId = track.getParticipantId();
            const type = track.getType();

            track.detach(track.containers[0]);

            return prev.map(user => user.userId === userId ? ({ ...user, [`${type}Track`]: null }) : user);
        })
    };

    const handleUserJoined = (id: string) => {
        console.log('handleUserJoined', id);
    }

    const handleUserLeft = (id: string) => {
        console.log('handleUserLeft', id);
        setUsersData(prev => prev.filter(user => user.userId !== id));
    }

  useEffect(() => {
      (async () => {
          JitsiControllerInstance.initConference({
              roomName: 'asdasdasdasd',
              onConnectionEstablished: () => {
                  JitsiControllerInstance.joinRoom();
                  console.log('connection success');
              },
              onConnectionFailed: () => {
                  console.log('connection failed');
              },
              onConnectionDisconnected: () => {
                  console.log('connection disconnected');
              },
              onLocalTracksAvailable: handleLocalTracks,
              onRemoteTrack: handleRemoteTracks,
              onConferenceJoined: handleConferenceJoined,
              onTrackRemoved: handleTrackRemoved,
              onUserJoined: handleUserJoined,
              onUserLeft: handleUserLeft,
          });
          await JitsiControllerInstance.establishConnection();
      })();
  }, []);

  return (
    <div>
        {usersData.map(user =>  (
            <>
                <UserVideo key={`${user.userId}_video`} track={user.videoTrack} />
                <UserAudio key={`${user.userId}_audio`} track={user.audioTrack} />
            </>
        ))}
    </div>
  );
}

export default App;
