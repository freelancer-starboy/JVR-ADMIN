'use client'
import React, { useEffect, useState } from 'react';
import OrdersLists from '@/components/eCommerce/OrdersList/OrdersLists';
import Features from '@/components/eCommerce/OrdersList/Features';
import Link from 'next/link';
import styles from '@/styles/PageTitle.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '@/utils/OrdersSlice';
import Preloader from '@/components/Loader/PreLoader';
import SearchForm from '@/components/_App/TopNavbar/SearchForm';

const OrdersList = () => {
  const [ currentPage, setCurrentPage ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { orders, totalPages, loading, error} = useSelector(state => state.Orders)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getOrders({ page: currentPage + 1, limit: 10, search: selected, searchQuery: searchQuery }))
  }, [dispatch, currentPage, selected, searchQuery])
 
 useEffect(() => {
  setCurrentPage(0)
 }, [selected, searchQuery])
  return (
    <>
      {/* Page title */}
      <div className={styles.pageTitle}>
        <h1>Orders List</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Orders List</li>
        </ul>
      </div>

      {/* Features */}
      {/* <Features /> */}

      {/* OrdersLists */}
      <SearchForm
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                />
      {loading ? <Preloader /> :       <OrdersLists orders={orders?.orders} setCurrentPage={setCurrentPage} currentPage={currentPage} totalPages={totalPages} setSelected={setSelected} setSearchQuery={setSearchQuery} searchQuery={searchQuery} error={error?.error} loading={loading?.loading} />
    }
    </>
  )
}

export default OrdersList;