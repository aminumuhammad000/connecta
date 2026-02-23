/**
 * GLOBAL NOTIFICATION SYSTEM USAGE GUIDE
 * =====================================
 * 
 * This file demonstrates how to use the global notification system
 * in any component that needs to interact with the backend.
 */

import { useNotification } from '../contexts/NotificationContext';

// Example 1: Basic Usage in a Component
function ExampleComponent() {
  const { showLoader, hideLoader, showSuccess, showError } = useNotification();

  const handleApiCall = async () => {
    // Show loader when starting the API call
    showLoader();

    try {
      const response = await fetch('http://localhost:5000/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'example' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success notification
        showSuccess('Operation completed successfully!');
      } else {
        // Show error notification
        showError(data.message || 'Operation failed');
      }
    } catch (error: any) {
      // Show error notification for network errors
      showError(`Error: ${error.message}`);
    } finally {
      // Always hide loader when done
      hideLoader();
    }
  };

  return <button onClick={handleApiCall}>Make API Call</button>;
}

// Example 2: Form Submission
function FormComponent() {
  const { showLoader, hideLoader, showSuccess, showError } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader();

    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* form data */ }),
      });

      if (response.ok) {
        showSuccess('Form submitted successfully!');
      } else {
        const data = await response.json();
        showError(data.message || 'Submission failed');
      }
    } catch (error: any) {
      showError('Network error occurred');
    } finally {
      hideLoader();
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}

// Example 3: Delete Action
function DeleteButton({ itemId }: { itemId: string }) {
  const { showLoader, hideLoader, showSuccess, showError } = useNotification();

  const handleDelete = async () => {
    showLoader();

    try {
      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Item deleted successfully!');
      } else {
        showError('Failed to delete item');
      }
    } catch (error) {
      showError('Error deleting item');
    } finally {
      hideLoader();
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}

// Example 4: Multiple API Calls
function MultipleCallsComponent() {
  const { showLoader, hideLoader, showSuccess, showError } = useNotification();

  const handleMultipleOperations = async () => {
    showLoader();

    try {
      // First API call
      const response1 = await fetch('http://localhost:5000/api/first');
      if (!response1.ok) throw new Error('First call failed');

      // Second API call
      const response2 = await fetch('http://localhost:5000/api/second');
      if (!response2.ok) throw new Error('Second call failed');

      // All successful
      showSuccess('All operations completed successfully!');
    } catch (error: any) {
      showError(error.message);
    } finally {
      hideLoader();
    }
  };

  return <button onClick={handleMultipleOperations}>Run Multiple Operations</button>;
}

/**
 * IMPORTANT NOTES:
 * ===============
 * 
 * 1. Always call showLoader() at the start of an API call
 * 2. Always call hideLoader() in the finally block
 * 3. Use showSuccess() for successful operations
 * 4. Use showError() for failed operations or errors
 * 5. Notifications auto-dismiss after 4 seconds
 * 6. Users can manually close notifications by clicking the X button
 * 7. The loader blocks all user interaction until hidden
 */

export {};
