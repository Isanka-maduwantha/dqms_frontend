
import { NavLink } from "react-router-dom";

function FooterBar() {
  return (
    <footer className="flex justify-between items-center pl-10 pr-10 pt-5 pb-5 h-14 w-full font-inter relative bottom-0 bg-white border-t border-border-grey">
      <div className="copyrights text-[12px]">
        <span>© 2026 Dental Surgery. All rights reserved.</span>
      </div>
      <ul className="action-links flex p-0 items-center gap-5 text-[12px]">
        <li>
          <NavLink to="/help">Help Center</NavLink>
        </li>
        <li>
          <NavLink to="/support">Contact Support</NavLink>
        </li>
        <li>
          <NavLink to="/security">Security Policy</NavLink>
        </li>
      </ul>
    </footer>
  );
}

export default FooterBar;
