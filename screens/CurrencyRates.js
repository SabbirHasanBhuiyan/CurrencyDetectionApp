import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';

const CurrencyRates = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currencyRates, setCurrencyRates] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCurrencyRates();
  }, [currentPage]);

  const fetchCurrencyRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!response.ok) {
        throw new Error('Failed to fetch currency rates. Response status: ' + response.status);
      }
      const data = await response.json();
      if (!data || !data.rates) {
        throw new Error('Currency rates data not available in the response');
      }
      const allRates = Object.entries(data.rates);
      setTotalPages(Math.ceil(allRates.length / itemsPerPage));
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setCurrencyRates(allRates.slice(startIndex, endIndex));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching currency rates:', error.message);
      setLoading(false);
    }
  };

  const renderCurrencyItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item[0]}</Text>
      <Text>{item[1]}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Currency</Text>
      <Text style={styles.headerText}>Rate</Text>
    </View>
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={currencyRates}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item[0]}
          ListHeaderComponent={renderHeader}
        />
      )}
      <View style={styles.pagination}>
        <TouchableOpacity style={styles.button} onPress={handlePrevPage} disabled={currentPage === 1}>
          <Text style={styles.buttonText}>Previous Page</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNextPage} disabled={currentPage === totalPages}>
          <Text style={styles.buttonText}>Next Page</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontWeight: 'bold',
  },
  headerText: {
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4267B2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
  },
});

export default CurrencyRates;
