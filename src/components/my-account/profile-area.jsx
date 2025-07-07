'use client';
import { useGetUserOrdersQuery } from '@/redux/features/order/orderApi';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorMsg from '../common/error-msg';
import Loader from '../loader/loader';
import ChangePassword from './change-password';
import MyOrders from './my-orders';
import NavProfileTab from './nav-profile-tab';
import ProfileInfo from './profile-info';
import ProfileNavTab from './profile-nav-tab';

export default function ProfileArea() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const [activeTab, setActiveTab] = useState('profile'); // Add tab state management

  // Check authentication first
  useEffect(() => {
    const userInfo = Cookies.get('userInfo');
    if (!userInfo) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Only query for orders if user is authenticated
  const {
    data: orderData,
    isError,
    isLoading,
  } = useGetUserOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: '100vh' }}
      >
        <Loader loading={true} />
      </div>
    );
  }

  // Don't render anything if not authenticated (during redirect)
  if (isAuthenticated === false) {
    return null;
  }

  // Handle loading and error states for authenticated users
  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: '100vh' }}
      >
        <Loader loading={true} />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: '100vh' }}
      >
        <ErrorMsg msg="There was an error loading your orders" />
      </div>
    );
  }

  // Render the enhanced profile for authenticated users with data
  return (
    <section className="profile__area pt-120 pb-120">
      <div className="container">
        <div className="profile__inner p-relative">
          <div className="row">
            <div className="col-xxl-4 col-lg-4">
              <div className="profile__tab mr-40">
                <ProfileNavTab
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
            <div className="col-xxl-8 col-lg-8">
              <div className="profile__tab-content">
                <div className="tab-content" id="profile-tabContent">
                  <div
                    className={`tab-pane fade ${
                      activeTab === 'profile' ? 'show active' : ''
                    }`}
                    id="nav-profile"
                    role="tabpanel"
                    aria-labelledby="nav-profile-tab"
                  >
                    <NavProfileTab orderData={orderData} />
                  </div>

                  <div
                    className={`tab-pane fade ${
                      activeTab === 'information' ? 'show active' : ''
                    }`}
                    id="nav-information"
                    role="tabpanel"
                    aria-labelledby="nav-information-tab"
                  >
                    <ProfileInfo />
                  </div>

                  <div
                    className={`tab-pane fade ${
                      activeTab === 'password' ? 'show active' : ''
                    }`}
                    id="nav-password"
                    role="tabpanel"
                    aria-labelledby="nav-password-tab"
                  >
                    <ChangePassword />
                  </div>

                  <div
                    className={`tab-pane fade ${
                      activeTab === 'order' ? 'show active' : ''
                    }`}
                    id="nav-order"
                    role="tabpanel"
                    aria-labelledby="nav-order-tab"
                  >
                    <MyOrders orderData={orderData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
