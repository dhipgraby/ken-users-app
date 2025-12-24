"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  LogIn,
  LogOut,
  LayoutGrid,
  Box,
  HelpCircle, //help icon
  Clock, // time icon
  Copy, // copy icon
  Check, // check icon
  FileText,
  Footprints,
  SlidersHorizontal,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Leaf,
  Flame,
  PieChart,
  Plug,
  Truck,
  Building2,
  Car,
  Factory,
  Wind,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Eye,
  Search,
  ExternalLink, // external links
  Link2,
  TriangleAlert,
  Ellipsis,
  Hexagon,
  Ticket,
  Package,
  LineChart,
  Users,
  User,
  Settings,
  CircleDashed,
  ShieldPlus,
  Info,
  X,
  Menu,
  Calendar,
  Book,
  MapPin
} from "lucide-react";

type Icons =
  | "menu"
  | "X"
  | "home"
  | "grid"
  | "info"
  | "user"
  | "users"
  | "login"
  | "logout"
  | "box"
  | "help"
  | "time"
  | "copy"
  | "check"
  | "fileText"
  | "footprints"
  | "sliders"
  | "add"
  | "remove"
  | "circleCheck"
  | "circleClose"
  | "leaf"
  | "flame"
  | "piechart"
  | "plug"
  | "truck"
  | "building"
  | "car"
  | "factory"
  | "wind"
  | "zap"
  | "down"
  | "left"
  | "right"
  | "wallet"
  | "eye"
  | "search"
  | "link"
  | "link2"
  | "warning"
  | "ellipsis"
  | "hexagon"
  | "ticket"
  | "package"
  | "linechart"
  | "settings"
  | "circleDashed"
  | "shieldPlus"
  | "sidebarOpen"
  | "sidebarClose"
  | "calendar"
  | "book"
  | "mapPin"
  | "recycle"
  | "plane"
  | "trash"
  | "infinity"
  | "edit";

// Optional additional imports for sidebar toggle icons
import { PanelLeftOpen, PanelLeftClose, Recycle, Plane, Trash2, Infinity as InfinityIcon, Pencil } from "lucide-react";

interface IconProps {
  icon: Icons;
  className?: string;
  // When false, disables any built-in color (e.g., text-red-500) so callers can control icon color
  colored?: boolean;
}

const IconController: React.FC<IconProps> = ({ icon, className, colored = true }) => {
  const _classname = cn("w-4 h-4", className);

  const getIcon = (icon: Icons) => {
    switch (icon) {
      case "home":
        return <Home className={_classname} />;
      case "grid":
        return <LayoutGrid className={_classname} />;
      case "user":
        return <User className={_classname} />;
      case "users":
        return <Users className={_classname} />;
      case "login":
        return <LogIn className={_classname} />;
      case "logout":
        return <LogOut className={_classname} />;
      case "box":
        return <Box className={_classname} />;
      case "help":
        return <HelpCircle className={_classname} />;
      case "time":
        return <Clock className={_classname} />;
      case "copy":
        return <Copy className={_classname} />;
      case "check":
        return <Check className={`${_classname} ${colored ? "text-green-500" : ""}`} />;
      case "fileText":
        return <FileText className={_classname} />;
      case "footprints":
        return <Footprints className={_classname} />;
      case "sliders":
        return <SlidersHorizontal className={_classname} />;
      case "add":
        return <Plus className={_classname} />;
      case "remove":
        return <Minus className={_classname} />;
      case "circleCheck":
        return <CheckCircle2 className={`${_classname} ${colored ? "text-green-500" : ""}`} />;
      case "circleClose":
        return <XCircle className={`${_classname} ${colored ? "text-red-500" : ""}`} />;
      case "leaf":
        return <Leaf className={`${_classname} ${colored ? "text-green-500" : ""}`} />;
      case "flame":
        return <Flame className={`${_classname} ${colored ? "text-red-500" : ""}`} />;
      case "piechart":
        return <PieChart className={_classname} />;
      case "plug":
        return <Plug className={_classname} />;
      case "truck":
        return <Truck className={_classname} />;
      case "building":
        return <Building2 className={_classname} />;
      case "car":
        return <Car className={_classname} />;
      case "factory":
        return <Factory className={_classname} />;
      case "wind":
        return <Wind className={_classname} />;
      case "zap":
        return <Zap className={_classname} />;
      case "down":
        return <ChevronDown className={_classname} />;
      case "left":
        return <ChevronLeft className={_classname} />;
      case "right":
        return <ChevronRight className={_classname} />;
      case "wallet":
        return <Wallet className={_classname} />;
      case "eye":
        return <Eye className={_classname} />;
      case "search":
        return <Search className={_classname} />;
      case "link":
        return <ExternalLink className={`${_classname} ${colored ? "text-blue-500" : ""}`} />;
      case "link2":
        return <Link2 className={_classname} />;
      case "warning":
        return <TriangleAlert className={`${_classname} ${colored ? "text-red-500" : ""}`} />;
      case "ellipsis":
        return <Ellipsis className={_classname} />;
      case "hexagon":
        return <Hexagon className={_classname} />;
      case "ticket":
        return <Ticket className={_classname} />;
      case "package":
        return <Package className={_classname} />;
      case "linechart":
        return <LineChart className={_classname} />;
      case "settings":
        return <Settings className={_classname} />;
      case "circleDashed":
        return <CircleDashed className={_classname} />;
      case "shieldPlus":
        return <ShieldPlus className={_classname} />;
      case "info":
        return <Info className={_classname} />;
      case "X":
        return <X className={_classname} />;
      case "menu":
        return <Menu className={_classname} />;
      case "sidebarOpen":
        return <PanelLeftOpen className={_classname} />;
      case "sidebarClose":
        return <PanelLeftClose className={_classname} />;
      case "calendar":
        return <Calendar className={_classname} />;
      case "book":
        return <Book className={_classname} />;
      case "mapPin":
        return <MapPin className={_classname} />;
      case "recycle":
        return <Recycle className={_classname} />;
      case "plane":
        return <Plane className={_classname} />;
      case "trash":
        return <Trash2 className={_classname} />;
      case "infinity":
        return <InfinityIcon className={_classname} />;
      case "edit":
        return <Pencil className={_classname} />;
      default:
        return null;
    }
  };

  return <>{getIcon(icon)}</>;
};

export default IconController;
