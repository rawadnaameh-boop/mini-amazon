"use client";

export default function HomeError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div>
            <p>Something went wrong while loading the product catalog.</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    );
}