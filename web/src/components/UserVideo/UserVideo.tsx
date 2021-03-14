import React, { useRef, useLayoutEffect, useState} from 'react';

const UserVideo = ({ track }) => {
    const videoRef = useRef<HTMLVideoElement | null>();
    const [videoTrackId, setVideoTrackId] = useState<string>('');

    useLayoutEffect(() => {
        if (videoRef?.current && track && track?.getId() !== videoTrackId) {
            track.attach(videoRef.current);
            setVideoTrackId(track.getId());
        }
    }, [track, videoTrackId]);

    return (
        <video style={{ width: '640px', height: '360px' }} ref={videoRef} autoPlay muted />
    );
};

export { UserVideo };