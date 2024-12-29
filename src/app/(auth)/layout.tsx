import { Navbar } from "@/components/navbar"
import { PropsWithChildren } from "react"

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default Layout
