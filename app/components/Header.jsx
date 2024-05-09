const Header = () => {
    return (
    <div className="relative border-t border-gray-200 bg-gray-50">
        <div className="absolute inset-0 h-36 opacity-90 lg:h-48"
        >
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 sm:px-12 lg:pt-24">
            <header className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Welcome to my website</h1>
                <p className="mt-2 text-sm font-semibold text-gray-400">
                </p>
            </header>
        </div>
    </div>
    )
}
export default Header;