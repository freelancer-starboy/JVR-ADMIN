import * as React from "react";
import IconButton from "@mui/material/IconButton";
import { Box, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import Preloader from "../Loader/PreLoader";

export default function ReadEmailContent({ details }) {
  if(!details){
    return <Preloader />
  }
  // Dropdown
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  console.log("details", details);
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px",
          mb: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #EEF0F7",
            paddingBottom: "10px",
            mb: "20px",
          }}
          className="for-dark-bottom-border"
        >
          <Typography
            as="h3"
            sx={{
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            JVR Support Team
          </Typography>

          <Box>
            <Tooltip title="Print">
              <IconButton
                size="small"
                sx={{ background: "#F2F6F8" }}
                className='ml-5px'
              >
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                sx={{ background: "#F2F6F8" }}
                className='ml-5px'
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Report Spam">
              <IconButton
                size="small"
                sx={{ background: "#F2F6F8" }}
                className='ml-5px'
              >
                <ErrorOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="More...">
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{
                  background: "#F2F6F8",
                }}
                className='ml-5px'
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem sx={{ fontSize: "14px" }}>Last 15 Days</MenuItem>
            <MenuItem sx={{ fontSize: "14px" }}>Last Month</MenuItem>
            <MenuItem sx={{ fontSize: "14px" }}>Last Year</MenuItem>
          </Menu>
        </Box>
        
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            mb={2}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <img 
                src="/images/user1.png" 
                alt="User" 
                width="44px"
                height="44px"
                className="borRadius100"
              />
              <Box className="ml-1">
                <Typography as='h5' fontSize="14px" fontWeight="500">{details.name}</Typography>
                <Typography fontSize="13px">From: {details.email}</Typography>
              </Box>
            </Box>

            <Box>
              <Typography fontSize="13px">{details.createdAt}</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="h6" gutterBottom fontSize="14px">
              {details.subject}
            </Typography>

            <Typography mb={2} style={{ whiteSpace : "pre-line"}}>
              {details.message}
            </Typography>

            
          </Box>
          
          <Stack direction="row" justifyContent="end" mt={2}>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<ReplyIcon sx={{ color: "#fff !important", }} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'capitalize',
                color: "#fff !important",
              }}
              className="mr-2"
            >
              Reply
            </Button>

            {/* <Button 
              variant="contained" 
              startIcon={<ForwardToInboxIcon sx={{ color: "#fff !important", }} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'capitalize',
                color: "#fff !important",
              }}
            >
              Forward
            </Button> */}
          </Stack>
        </Box>
      </Card>
    </>
  );
}
