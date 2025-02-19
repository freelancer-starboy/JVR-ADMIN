import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Box, Typography } from "@mui/material";
import TrackOrder from "@/components/eCommerce/OrderDetails/TrackOrder";
import OrderTable from "@/components/eCommerce/OrderDetails/TrackOrder/OrderTable";
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css'
import { Router, useRouter } from "next/router";
import { useGetOrdersQuery } from "@/utils/api/ChekoutApi";
import Preloader from "@/components/Loader/PreLoader";

const OrderDetails = () => {
    const router = useRouter()
    const { id } = router.query
    const { data: orders, isLoading } = useGetOrdersQuery(id, {
      refetchOnMountOrArgChange: true
    })
    const [allOrders, setAllOrders] = useState(null)
    useEffect(() => {
        if(orders){

            setAllOrders(orders)
        }
    }, [orders])

    if(isLoading){
        return <Preloader />
    }
  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Order Details</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Order Details</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={4}>
          {/* TrackOrder */}
          <TrackOrder trackOrders={allOrders?.order} />
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={8}>
          {/* OrderTable */}
          <OrderTable allOrders={allOrders?.order} />
        </Grid>
      </Grid>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={12} xl={4}>
          <Card
            sx={{
              boxShadow: "none",
              borderRadius: "10px",
              p: "25px 20px",
              mb: "15px",
            }}
          >
            <Typography
              as="h3"
              sx={{
                fontSize: 16,
                fontWeight: 500,
                mb: "15px",
              }}
            >
              Shipping Information
            </Typography>

            <Typography
              as="h3"
              sx={{
                fontSize: 14,
                fontWeight: 500,
                mb: "15px",
              }}
            >
              {allOrders?.order?.shippingAddress?.fullName}
            </Typography>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "60px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Address:
                </span>
                {allOrders?.order?.shippingAddress?.addressLine1}
                {allOrders?.order?.shippingAddress?.addressLine2},
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "60px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Phone:
                </span>
                {allOrders?.order?.shippingAddress?.phone}

              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "60px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  City:
                </span>
                {allOrders?.order?.shippingAddress?.city}

              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "60px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  State:
                </span>
                {allOrders?.order?.shippingAddress?.state} - {allOrders?.order?.shippingAddress?.postalCode}

              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={12} lg={12} xl={4}>
          <Card
            sx={{
              boxShadow: "none",
              borderRadius: "10px",
              p: "25px 20px",
              mb: "15px",
            }}
          >
            <Typography
              as="h3"
              sx={{
                fontSize: 16,
                fontWeight: 500,
                mb: "15px",
              }}
            >
              Billing Information
            </Typography>

            <Typography
              as="h3"
              sx={{
                fontSize: 14,
                fontWeight: 500,
                mb: "15px",
              }}
            >
              
            </Typography>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Payment Type:
                </span>
                {allOrders?.order?.paymentDetails?.method}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Transaction ID:
                </span>
                {allOrders?.order?.paymentDetails?.transactionId}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Status :
                </span>
                {allOrders?.order?.paymentDetails?.status}

              </Typography>

              
            </Box>
          </Card>
        </Grid>

        {/* <Grid item xs={12} md={12} lg={12} xl={4}>
          <Card
            sx={{
              boxShadow: "none",
              borderRadius: "10px",
              p: "25px 20px",
              mb: "15px",
            }}
          >
            <Typography
              as="h3"
              sx={{
                fontSize: 16,
                fontWeight: 500,
                mb: "15px",
              }}
            >
              Delivery Info
            </Typography>

            <Typography
              as="h3"
              sx={{
                fontSize: 14,
                fontWeight: 500,
                mb: "15px",
              }}
            >
              UPS Delivery
            </Typography>

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Order ID :
                </span>
                xxxx235
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Payment Mode :
                </span>
                COD
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  mt: "10px",
                  display: "flex",
                }}
              >
                <span
                  style={{
                    width: "100px",
                    fontWeight: "500",
                  }}
                  className='mr-10px'
                >
                  Email:
                </span>
                info@contact.com
              </Typography>
            </Box>
          </Card>
        </Grid> */}
      </Grid>
    </>
  );
};

export default OrderDetails;
