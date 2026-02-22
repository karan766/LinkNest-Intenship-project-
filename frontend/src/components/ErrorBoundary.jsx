import React from 'react';
import { Box, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          minH="100vh" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bg={this.props.bg || "gray.50"}
        >
          <VStack spacing={4} textAlign="center" p={8}>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              Something went wrong
            </Text>
            <Text color="gray.600" maxW="md">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;