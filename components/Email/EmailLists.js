import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { getContactList } from "../redux/actions";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Box,
  Checkbox,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { getContactList } from "@/utils/contactSlice";

export default function EmailLists() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getContactList());
  }, [dispatch]);

  const { contacts } = useSelector((state) => state.contacts);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ boxShadow: "none", borderRadius: "10px", p: "25px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #EEF0F7",
          paddingBottom: "10px",
          mb: "20px",
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>Email List</Typography>
        <Box>
          <Tooltip title="Print">
            <IconButton sx={{ background: "#F2F6F8" }}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton sx={{ background: "#F2F6F8" }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Report Spam">
            <IconButton sx={{ background: "#F2F6F8" }}>
              <ErrorOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More...">
            <IconButton onClick={handleClick} sx={{ background: "#F2F6F8" }}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem>Last 15 Days</MenuItem>
            <MenuItem>Last Month</MenuItem>
            <MenuItem>Last Year</MenuItem>
          </Menu>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableBody>
            {contacts && contacts.contactDetails?.length > 0 && contacts?.contactDetails?.map((contact) => (
              <TableRow key={contact._id}>
                <TableCell>
                  <Checkbox size="small" />
                </TableCell>
                <TableCell>
                  <Checkbox icon={<StarBorderIcon />} checkedIcon={<StarIcon />} />
                </TableCell>
                <TableCell sx={{ fontSize: "13px" }}>
                  <Link href={`/ecommerce/email/read-email/${contact._id}`} className="readEmail">
                    {contact.name}
                  </Link>
                </TableCell>
                <TableCell sx={{ fontSize: "13px" }}>
                  <Link href={`/ecommerce/email/read-email/${contact._id}`} className="readEmail">
                    {contact.subject}
                  </Link>
                </TableCell>
                <TableCell align="right" sx={{ fontSize: "13px" }}>
                  {contact.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
