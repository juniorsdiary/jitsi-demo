import React, { useState, useLayoutEffect, useRef } from 'react';

const UserAudio = ({ track }) => {
    const audioRef = useRef<HTMLVideoElement | null>();
    const [audioTrackId, setAudioTrackId] = useState<string>('');

    useLayoutEffect(() => {
        if (audioRef?.current && track && track?.getId() !== audioTrackId) {
            track.attach(audioRef.current);
            setAudioTrackId(track.getId());
        }
    }, [track, audioTrackId]);

    return (
        <audio ref={audioRef} autoPlay muted />
    );
};

export { UserAudio };