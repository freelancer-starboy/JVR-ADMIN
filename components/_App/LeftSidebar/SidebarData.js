import React from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GridViewIcon from "@mui/icons-material/GridView";
import LayersIcon from "@mui/icons-material/Layers";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import PostAddIcon from "@mui/icons-material/PostAdd";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AddchartIcon from "@mui/icons-material/Addchart";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

export const SidebarData = [
  
  {
    title: "eCommerce",
    path: "/ecommerce/products/",
    icon: <ShoppingCartCheckoutIcon />,
    iconClosed: <KeyboardArrowRightIcon />,
    iconOpened: <KeyboardArrowDownIcon />,

    subNav: [
      {
        title: "Products",
        path: "/ecommerce/products/",
      },
      // {
      //   title: "Product Details",
      //   path: "/ecommerce/product-details/",
      // },
      {
        title: "Add Products",
        path: "/ecommerce/Add-Products/",
      },
      // {
      //   title: "Update Products",
      //   path: "/ecommerce/Update-Products/",
      // },
      {
        title: "Orders List",
        path: "/ecommerce/orders-list/",
      },
     
      {
        title: "Customers",
        path: "/ecommerce/customers/",
      },
      
      // {
      //   title: "Checkout",
      //   path: "/ecommerce/checkout/",
      // },
      {
        title: "Enquiries",
        path: "/ecommerce/email/inbox",
      },
    ],
  }

];
