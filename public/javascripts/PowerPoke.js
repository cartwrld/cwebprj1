const Pokemon = require('./Pokemon.js');


const currentOffset = 0;
const API_ROOT = 'https://pokeapi.co/api/v2/';
const pokeCollection = [];


class PowerPoke {
  // async genPokeObjCollection() {
  //   if (pokeCollection.length === 0) {
  //     const res = await fetch(`${API_ROOT}pokemon?limit=1015&offset=0`);
  //     if (res.ok) {
  //       const collectionData = await res.json();
  //       for (let i = 0; i < 1015; i++) {
  //         const pokeRes = await fetch(collectionData.results[i].url);
  //         if (pokeRes.ok) {
  //           const pokeData = await pokeRes.json();
  //           pokeCollection.push(this.buildPokeObj(pokeData));
  //         }
  //       }
  //       console.log('pokecollection created');
  //       return await collectionData;
  //     } else {
  //       console.log('not ok');
  //     }
  //   }
  // }


  /**
     * Initial fetch to get the length of the resultset in order to generate 10 random Pokemon within the boundaries
     * @return {Promise<any|undefined>} - JSON Object
     */
  async getPokemonByGeneration(gen) {
    try {
      const getPokeCountData = async () => {
        const randGen = gen === undefined || gen === null ? Math.floor((Math.random() * 9) + 1) : gen;
        const res = await fetch(`${API_ROOT}/generation/${randGen}`);
        if (res.ok) {
          const genPokeData = await res.json();
          // console.log(genPokeData.pokemon_species);
          return genPokeData;
        }
      };
      return await getPokeCountData();
    } catch (error) {
      console.error(error);
    }
  }

  /**
     * Method used to generate 10 random Pokemon when the homepage is initially loaded.
     * Fetches 10 random Pokemon (may include duplicates) based on the length of the initial resulset.
     * @param initResp - Response from the initial call to get the length of the results
     * @return {Promise<*[]>} - Array of 10 random Pokemon objs
     */
  async get8RandomPokeURLFromInitialFetch(initResp) {
    // console.log('=======================');
    // console.log(initResp);
    // console.log('=======================');
    const rndmPokes = [];
    try {
      // 10 times to generate 10 Pokemon
      const randomNumbers = Array.from({length: 8}, () => Math.floor(Math.random() * initResp.pokemon_species.length) + 1);
      for (let i = 0; i < 8; i++) {
        // const randomNum = Math.floor(Math.random() * initResp.results.length); // generate random number is within the resultset
        // const randomNum = Math.floor(Math.random() * initResp.pokemon_species.length); // generate random number is within the resultset
        // let randPokeURL = initResp.pokemon_species[randomNum].url;// select the URL of the pokemon in the resultset with the random number
        let randPokeURL = initResp.pokemon_species[randomNumbers[i]].url;// select the URL of the pokemon in the resultset with the random number
        randPokeURL = randPokeURL.replace('-species', '');
        // console.log(randPokeURL + '============');
        const pokeRes = await fetch(randPokeURL);// fetch with specific URL corresponding to the randomly chosen pokemon

        if (pokeRes.ok) {
          const randPokeData = await pokeRes.json(); // JSON obj
          // console.log(randPokeData);

          const randPoke = this.buildPokeObj(randPokeData); // Pokemon obj
          rndmPokes.push(randPoke);
        }
      }
      return rndmPokes; // Returning an array of 10 Pokemon
    } catch (error) {
      console.error(error);
    }
    return rndmPokes;
  }

  async getFirst20PokeURLFromInitFetch() {
    const poke20List = [];
    try {
      let pokeStartNum = 1;
      // 10 times to generate 10 Pokemon
      for (let i = 0; i < 20; i++) {
        // const randomNum = Math.floor(Math.random() * initResp.results.length); // generate random number is within the resultset
        // const pokeURL = initResp.pokemon_species[i].url;// select the URL of the pokemon in the resultset with the random number


        const pokeRes = await fetch(`${API_ROOT}pokemon/${pokeStartNum++}`);// fetch with specific URL corresponding to the randomly chosen pokemon

        if (pokeRes.ok) {
          const randPokeData = await pokeRes.json(); // JSON obj

          const randPoke = await this.buildPokeObj(randPokeData); // Pokemon obj
          poke20List.push(randPoke);
        }
      }
      return poke20List; // Returning an array of 20 Pokemon
    } catch (error) {
      console.error(error);
    }
    return poke20List;
  }

  // async getNext20Pokes() {
  //   const poke20List = [];
  //   try {
  //     for (let i= currentOffset; i<currentOffset + 20; i++) {
  //       const response = await fetch(`${API_ROOT}pokemon/${i}`);
  //       if (response.ok) {
  //         const results = response.json();
  //         const newPoke = this.buildPokeObj(results);
  //         poke20List.push(newPoke);
  //       }
  //     }
  //     return poke20List;
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return poke20List;
  // }
  /**
     * Method that can be used for constructing a Pokemon object from the JSON data
     * @param pokeData - JSON Object corresponding to the current random Pokemon
     * @return {Pokemon} - Pokemon to add to the rndmPokes array
     */
  buildPokeObj(pokeData) {
    // console.log(pokeData);
    const p = new Pokemon(
        pokeData.name,
        pokeData.id,
        pokeData.sprites?.front_default,
        pokeData.stats,
        pokeData.types[0].type.name,
    );

    if (pokeData.types.length > 1) {
      p.type2 = pokeData.types[1].type.name;
    }

    return p;
  }

  /**
     * Main method that will format the Pokemon names with a capitalized first letter;
     * @param name - The Pokemon name
     * @return {string} - The formatted Pokemon name
     */
  formatPokeName(name) {
    if (!name.includes(' ') && !name.includes('.') && !name.includes('-')) {
      return this.capitalizeFirstLetterOfValue(name);
    }
    let formattedName = this.handleOddCharsInName(name, ' ');
    formattedName = this.handleOddCharsInName(formattedName, '-');

    return formattedName.trim();
  }

  /**
     * Helper method for the formatPokeName method.
     * Takes in the original name, and the char that you want to split the string at.
     * Returns the formatted version of the name
     *
     * @param nameVal - The name you are dealing with
     * @param char - The char that you would like to split the string at
     * @return {*|string} - The formatted name value
     */
  handleOddCharsInName(nameVal, char) {
    let fixedName = '';
    if (nameVal.includes(char)) {
      const nameArr = nameVal.split(char);
      for (const str of nameArr) {
        fixedName += this.capitalizeFirstLetterOfValue(str) + char;
      }
      return fixedName;
    } else return nameVal;
  }

  /**
     * Helper method for capitalizing the first letter of a word.
     * Designed for formatting Pokemon names and Types.
     * @param value - String you would like to capitalize the first letter of
     * @return {string} - The formatted name
     */
  capitalizeFirstLetterOfValue(value) {
    if (value === null || value === undefined) {
      return;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  async handleFiltersApply(nameID, type1, type2, gen) {
    const filteredPokes = [];
    // Conditions where only one criterion is provided
    if (nameID && !gen && !type1 && !type2) {
      const poke = await this.fetchByNameOrID(nameID);
      filteredPokes.push(poke);
    }
    return filteredPokes;
  };


  async fetchByNameOrID(searchNameID) {
    try {
      const getNameOrIDSearchResults = async () => {
        const nameRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchNameID}/`);
        if (nameRes.ok) {
          const pokeData = await nameRes.json();
          // console.log(countData.results.length);
          return this.buildPokeObj(pokeData);
        }
      };
      return await getNameOrIDSearchResults();
    } catch (error) {
      console.error(error);
    }
  }

  async fetchByGeneration(searchGen) {
    try {
      const getGenOnlySearchResults = async () => {
        const genRes = await fetch(`https://pokeapi.co/api/v2/generation/${searchGen}/`);
        if (genRes.ok) {
          const countData = await genRes.json();
          // console.log(countData.results.length);
          return countData;
        }
      };
      return await getGenOnlySearchResults();
    } catch (error) {
      console.error(error);
    }
  }
}


module.exports = PowerPoke;
