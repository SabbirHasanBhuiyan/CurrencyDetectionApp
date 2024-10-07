import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery, gql } from '@apollo/client';

const CountryQuery = gql`
  query CountryQuery {
    countries {
      name
      capital
      currency
      code
    }
  }
`;

const CountryInfo = () => {
  const { data, loading } = useQuery(CountryQuery);
  const [countries, setCountries] = useState([]); // Initialize countries state
  const [currentPage, setCurrentPage] = useState(1);
  const countriesPerPage = 10;

  useEffect(() => {
    if (data && data.countries) {
      setCountries(data.countries);
    }
  }, [data]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (!data || data.countries.length === 0) return <Text style={styles.errorText}>No countries found.</Text>;

  // Calculate the indices of the countries to display on the current page
  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = countries.slice(indexOfFirstCountry, indexOfLastCountry); // Use the state variable
  const totalPages = Math.ceil(countries.length / countriesPerPage);

  const renderCountryItem = ({ item, index }) => (
    <View style={styles.item}>
      <Text style={styles.serialNo}>{index + indexOfFirstCountry + 1}.</Text>
      <Text style={styles.heading}>Country: <Text style={styles.text}>{item.name}</Text></Text>
      <Text style={styles.heading}>Capital: <Text style={styles.text}>{item.capital}</Text></Text>
      <Text style={styles.heading}>Currency: <Text style={styles.text}>{item.currency}</Text></Text>
      <Text style={styles.heading}>Code: <Text style={styles.text}>{item.code}</Text></Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={currentCountries}
        renderItem={renderCountryItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.container}
      />

      {/* Pagination Buttons */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    paddingBottom: 100, // Added space for pagination buttons
  },
  item: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serialNo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  text: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#555',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  pageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#4267B2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
  },
});

export default CountryInfo;
