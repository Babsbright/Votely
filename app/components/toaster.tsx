import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';


const Toaster: React.FC = () => {
    return (
        <div>
            <HotToaster
          position="top-right"
          toastOptions={{
              success: {
            style: {
                background: "#4ade80",
                color: "black",
            },
              },
              error: {
            style: {
                background: "#f87171",
                color: "white",
            },
              },
          }}
            />
        </div>
    );
};

export default Toaster;