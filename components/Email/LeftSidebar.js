import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import styles from "@/components/Email/LeftSidebar.module.css";
import Badge from "@mui/material/Badge";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { getContactList, specificTypeEmail } from "@/utils/contactSlice";
const RichTextEditor = dynamic(() => import("@mantine/rte"), {
  ssr: false,
});




const LeftSidebar = () => {
  const router = useRouter();
  const dispatch = useDispatch()
 
  const { unread, totalEmails } = useSelector((state) => state.contacts);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  console.log("unread", unread)
 

  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          p: "25px 20px",
          mb: "15px",
        }}
      >

        <Typography
          sx={{
            textTransform: "uppercase",
            fontSize: "13px",
            color: "#A9A9C8",
            mb: "10px",
          }}
        >
          mailbox
        </Typography>

        {/* Nav */}
        <ul className={styles.leftNav}>
          <li
            className={router.pathname == "/email/inbox" ? styles.active : ""}
          >
            <Link href="#" onClick={() => dispatch(specificTypeEmail())}>
              <span>
                <i className="ri-mail-line"></i> Un read
              </span>
              <Badge
                badgeContent={unread === 0 ? "0" : unread}
                color="primary"
                sx={{
                  position: "relative",
                  top: "15px",
                }}
                className="float-right right-10px for-dark-text-white"
              ></Badge>
            </Link>
          </li>

          <li className={router.pathname == "#" ? styles.FormDataactive : ""}>
            <Link href="#" onClick={() => dispatch(getContactList())}>
              <i className="ri-star-fill"></i> All Emails
              <Badge
                badgeContent={totalEmails}
                color="primary"
                sx={{
                  position: "relative",
                  top: "15px",
                }}
                className="float-right right-10px for-dark-text-white"
              ></Badge>
            </Link>
          </li>

          
        </ul>

        
      </Card>

   
    </>
  );
};

export default LeftSidebar;
