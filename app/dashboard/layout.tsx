import SideNav from '../../components/ui/sidenav';
import Header from '../../components/ui/header';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <Header></Header>
    <div className="flex mt-10 flex-col bg-accent h-[calc(100vh-40px)]">
      
      {/* <div className="w-full flex-none md:w-64">
        <SideNav />
      </div> */}
      <div className="flex-grow p-6 bg-accent">{children}</div>
    </div>
    </>
  );
}