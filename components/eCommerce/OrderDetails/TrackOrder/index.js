import React from "react";
import { 
  Box, 
  Typography, 
  Card,
  Stepper,
  Step,
  StepLabel,
  Button,
  styled
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from "axios";
import { toast } from "react-toastify";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: '#ffffff'
}));

const OrderInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  borderRadius: theme.spacing(1),
}));

const StatusButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1, 3),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
}));

// Custom StepLabel styles for completed and active states
const CustomStepLabel = styled(StepLabel)(({ theme, completed, active }) => ({
  '& .MuiStepLabel-label': {
    mt: 1,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: completed || active ? '#2196f3' : theme.palette.text.primary,
  },
  '& .MuiStepLabel-iconContainer': {
    '& .MuiSvgIcon-root': {
      color: completed ? '#2196f3' : 
             active ? '#2196f3' : 
             theme.palette.grey[400],
      fontSize: 28,
    }
  }
}));

const orderSteps = [
  {
    label: "Processing",
    icon: <SettingsIcon />
  },
  {
    label: "Packed",
    icon: <InventoryIcon />
  },
  {
    label: "Dispatched",
    icon: <LocalShippingIcon />
  },
  {
    label: "Delivered",
    icon: <CheckCircleIcon />
  }
];

const TrackOrder = ({ trackOrders }) => {
  const getStepNumber = (status) => {
    return orderSteps.findIndex(step => step.label === status);
  };

  const currentStep = getStepNumber(trackOrders?.orderStatus);

  const handleStatusUpdate = async () => {
    let newStatus = '';
    if (trackOrders?.orderStatus === "Processing") {
      newStatus = "Packed";
    } else if (trackOrders?.orderStatus === "Packed") {
      newStatus = "Dispatched";
    } else if (trackOrders?.orderStatus === "Dispatched") {
      newStatus = "Delivered";
    } else if (trackOrders?.orderStatus === "Delivered") {
      return;
    }
  
    try {
      const response = await axios.put(`/api/Orders/updateStatus?id=${trackOrders?._id}&status=${newStatus}`);
      if (response.status === 201) {
        toast.success(`Order status updated to ${newStatus}`);
        // Reload the page to update the values
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Function to determine if a step is completed based on current status
  const isStepCompleted = (index) => {
    return index <= currentStep;
  };

  return (
    <StyledCard>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: '#2c3e50'
        }}
      >
        Track Order
      </Typography>

      <OrderInfoBox>
        <Box>
          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
            Order ID
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            #-JVR-{trackOrders?._id}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
            Current Status
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600,
              color: '#3498db'
            }}
          >
            {trackOrders?.orderStatus}
          </Typography>
        </Box>
      </OrderInfoBox>

      <Stepper 
        activeStep={currentStep} 
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {orderSteps.map((step, index) => (
          <Step key={step.label} completed={isStepCompleted(index)}>
            <CustomStepLabel 
              icon={step.icon}
              completed={isStepCompleted(index)}
              active={index === currentStep}
            >
              {step.label}
            </CustomStepLabel>
          </Step>
        ))}
      </Stepper>

      {trackOrders?.orderStatus !== "Delivered" && (
        <StatusButton
          variant="contained"
          color="primary"
          onClick={handleStatusUpdate}
          fullWidth
        >
          Update to {orderSteps[currentStep + 1]?.label}
        </StatusButton>
      )}
    </StyledCard>
  );
};

export default TrackOrder;