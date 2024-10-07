import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery, gql } from '@apollo/client';

const CountryQuery = gql`
  query CountryQuery {
    countries {
      name
      capital
      currency
    }
  }
`;

const CountryInfo = () => {
  const { data, loading } = useQuery(CountryQuery);
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const countriesPerPage = 10;

  useEffect(() => {
    if (data && data.countries) {
      setCountries(data.countries);
    }
  }, [data]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (!data || data.countries.length === 0) return <Text style={styles.errorText}>No countries found.</Text>;

  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = countries.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(countries.length / countriesPerPage);

  const renderCountryItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.detail}> {item.capital}</Text>
      <Text style={styles.detail}> {item.currency}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Country</Text>
      <Text style={styles.headerText}>Capital</Text>
      <Text style={styles.headerText}>Currency</Text>
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
        <>
          <FlatList
            data={currentCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.countries}
            ListHeaderComponent={renderHeader}
          />
          <View style={styles.pagination}>
            <TouchableOpacity style={styles.button} onPress={handlePrevPage} disabled={currentPage === 1}>
              <Text style={styles.buttonText}>Previous Page</Text>
            </TouchableOpacity>
            <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
            <TouchableOpacity style={styles.button} onPress={handleNextPage} disabled={currentPage === totalPages}>
              <Text style={styles.buttonText}>Next Page</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    flex: 1,
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
  },
  buttonText: {
    color: '#fff',
  },
  pageText: {
    fontSize: 16,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
  },
});

export default CountryInfo;
