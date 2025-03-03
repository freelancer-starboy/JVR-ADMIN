import React, { useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css'
import LeftSidebar from '@/components/Email/LeftSidebar';
import ReadEmailContent from '@/components/Email/ReadEmailContent';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getSpecificContact } from '@/utils/contactSlice';
 
export default function ReadEmail() {
   const router = useRouter()
   const { id } = router.query
   const dispatch = useDispatch()

   useEffect(() => {
    if(id){

        console.log("id", id)
          dispatch(getSpecificContact(id));
    }
   }, [dispatch, id]);

   const { contacts } = useSelector((state) => state.contacts);
  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Read Email</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Read Email</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={4} lg={4} xl={3}>
          {/* LeftSidebar */}
          <LeftSidebar />
        </Grid>

        <Grid item xs={12} md={8} lg={8} xl={9}>
          {/* ReadEmailContent */}
          <ReadEmailContent details={contacts?.contactDetails || {}} />
        </Grid>
      </Grid>
    </>
  );
}
