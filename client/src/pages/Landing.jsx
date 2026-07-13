import { Link } from "react-router-dom";
export default function Landing() {
    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
                <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">
                    Your personal coach
                </p>
                <h1 className="text-6xl font-black text-white mb-6 leading-none">
                    Master the<br />impossible
                </h1>
                <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
                    Build real strength. Follow a structured plan. Hit milestones that matter.
                </p>
                <blockquote className="text-zinc-600 italic text-sm mb-12">
                    "Discipline is choosing between what you want now and what you want most."
                </blockquote>
                <Link
                    to="/setup"
                    className="inline-block bg-white text-zinc-950 font-bold px-8 py-4 rounded-xl hover:bg-zinc-200 transition text-base"
                >
                    Start Training →
                </Link>
            </div>
        </main>
    )
}