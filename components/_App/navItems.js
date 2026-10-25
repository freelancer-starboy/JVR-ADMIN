import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

// `match` decides when an item is highlighted for the current route.
export const NAV_SECTIONS = [
  {
    title: null,
    items: [{ label: "Dashboard", href: "/dashboard", icon: SpaceDashboardOutlinedIcon, match: (p) => p === "/dashboard" }],
  },
  {
    title: "Catalogue",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: CheckroomOutlinedIcon,
        match: (p) => p.startsWith("/products") && p !== "/products/new",
      },
      { label: "Add Product", href: "/products/new", icon: AddPhotoAlternateOutlinedIcon, match: (p) => p === "/products/new" },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "WhatsApp Leads", href: "/leads", icon: WhatsAppIcon, match: (p) => p.startsWith("/leads"), badge: "newLeads" },
      {
        label: "Enquiries",
        href: "/enquiries",
        icon: MailOutlineIcon,
        match: (p) => p.startsWith("/enquiries"),
        badge: "unreadEnquiries",
      },
      { label: "Orders", href: "/orders", icon: ReceiptLongOutlinedIcon, match: (p) => p.startsWith("/orders") },
      { label: "Reviews", href: "/reviews", icon: RateReviewOutlinedIcon, match: (p) => p.startsWith("/reviews") },
    ],
  },
];
