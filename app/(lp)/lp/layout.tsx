import { NavBarB } from '@/components/landing/nav-bar-b'
import { FooterB } from '@/components/landing/footer-b'

export default function LpLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="features-dark-override" style={{ minHeight: '100vh', background: '#050812' }}>
            <NavBarB />
            <main>{children}</main>
            <FooterB />
        </div>
    )
}
