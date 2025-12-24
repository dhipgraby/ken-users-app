import React from "react";
import Link from "next/link";
import FrameworkLogo from "./framework-logo";

const Logo: React.FC = () => {
  return (
    <div className="m-auto mt-20 ta-c">
      <Link href="/">
        <FrameworkLogo className="m-auto" size={80} variant="light" withShadow={true} />
      </Link>
    </div>
  );
};

export default Logo;
