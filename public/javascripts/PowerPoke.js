const Pokemon = require('./Pokemon.js');

const API_ROOT = 'https://pokeapi.co/api/v2';

class PowerPoke {
  /**
     * This method is used when the Homepage and TeamBuilder page are loaded.
     * This function takes in an option Generation number, so that you can set a specific Generation
     * to fetch, or if nothing is passed in, it will pick a random number between 1-9.
     * @param gen - The generation number being passed in
     * @return {Promise<any|undefined>}- JSON Object containing the info about the Generation called
     */
  async getPokemonByGeneration(gen) {
    try {
      const getPokeCountData = async () => {
        const randGen = gen === null ? Math.floor((Math.random() * 9) + 1) : gen;
        const res = await fetch(`${API_ROOT}/generation/${randGen}`);
        if (res.ok) {
          return await res.json();
        }
      };
      // returns results from the fetch by generation
      return await getPokeCountData();
    } catch (error) {
      console.error(error);
    }
  }

  /**
     * Method used to generate 8 random Pokemon when the homepage is initially loaded.
     * Fetches 8 random Pokemon (may include duplicates) based on the length of the initial result set.
     *
     * @param {Object} initResp - Response from the initial call to get the length of the results. Expected to have a 'pokemon_species' property containing an array.
     * @return {Promise<Object[]>} - Array of 8 random Pokemon objects.
     */
  async get8RandomPokeURLFromInitialFetch(initResp) {
    const rndmPokes = [];
    try {
      // create an array of 10 random numbers that are within the range of the generation
      const randomNumbers = Array.from({length: 8}, () => Math.floor(Math.random() * initResp.pokemon_species.length) + 1);

      // going through each of the random numbers to fetch the pokemon with that ID
      const rand8Data = randomNumbers.map((i) => {
        return fetch(`${API_ROOT}/pokemon/${i}`)
            .then((rand8Res) => {
              if (rand8Res.ok) {
                // json response is returned as rand8Data below
                return rand8Res.json();
              }
            })
        // to here, then a pokemon object is created that corresponds to each of the random numbers
        // that were created earlier
            .then((rand8Data) => this.buildPokeObj(rand8Data));
      });

      // Promise.all() collects all of the promises into one, resulting an array of Pokemon objs
      const rand8Pokes = await Promise.all(rand8Data);
      return rand8Pokes; // Returning an array of 20 Pokemon
    } catch (error) {
      console.error(error);
    }
    return rndmPokes;
  }

  /**
     * This method is responsible for retrieving the first 20 Pokemon to browse as team options.
     * To deal with long loading times when the page was accessed, this method uses a stream for
     * retrieving the first 20 items from the API. By using Promise.all() for the entire array
     * rather than doing one promise at a time, it greatly reduces loading times.
     * @return {Promise<Object[]|[]>} - Resolves to an array of the first 20 Pokemon objects. Returns an empty array on error.
     */
  async getFirst20PokeObjFromGenFetch() {
    try {
      // stream to generate an array from 1-20, then use the sequencer to iterate through
      const first20Poke = Array.from({length: 20}, (_, i) => {
        //  starting with pokemon ID #1 to ID #20
        return fetch(`${API_ROOT}/pokemon/${i + 1}`)
            .then((first20Res) => {
              if (first20Res.ok) {
                // first20Res.json() represents the JSON obj for the call on an individual pokemon,
                // which is later passed to this.buildPokeObj() to create the pokemon obj
                return first20Res.json();
              }
            })
        // return first20Res as res20Data
            .then((res20Data) => this.buildPokeObj(res20Data));
      });
      // reduced unnecessary variables
      return await Promise.all(first20Poke);
    } catch (error) {
      console.error(error);
    }
    // reduced unnecessary variables
    return [];
  }

  /**
     * Filters and fetches Pokemon based on provided search criteria. If no filters are selected,
     * it will retrieve the first 20 Pokemon.
     *

     *
     * @param {string} nameID - The name or ID of the Pokemon.
     * @param {string} type1 - The primary type to filter by.
     * @param {string} type2 - The secondary type to filter by.
     * @param {string} gen - The generation to filter by.
     * @return {Promise<Object[]>} - Returns an array of filtered Pokemon objects. If no filters are provided, it retrieves the first 20 Pokemon.
     */
  async handleFiltersApply(nameID, type1, type2, gen) {
    // if no filters are selected, do nothing
    if (nameID === '' && type1 === '' && type2 === '' && gen === '') {
      return await this.getFirst20PokeObjFromGenFetch();
    }

    // convert to lowercase for easy searching
    let filteredPokes;
    nameID = nameID.toLowerCase().trim();
    type1 = type1.toLowerCase().trim();
    type2 = type2.toLowerCase().trim();
    gen = gen.toLowerCase().trim();

    /**
         * Handles the filtering logic to fetch Pokemon based on provided criteria within the closure.
         * - If only name/ID is provided: Searches directly for that name/ID.
         * - If gen is provided: Filters by generation first, then by types if provided.
         * - If gen is not provided but types are: Filters by types.
         *
         * This function doesn't directly take parameters but relies on the outer function's variables
         * like nameID, type1, type2, and gen.
         *
         * @return {Promise<Pokemon[]>} - Returns an array of filtered Pokemon objects. The exact content depends on the filtering criteria.
         */
    const filterHandler = async () => {
      // return array
      filteredPokes = [];


      // if only name or ID is present in search, disregard other filters and search directly with name
      if (nameID && type1 === '' && type2 === '' && gen === '') {
        const poke = await this.fetchByNameOrID(nameID);
        filteredPokes.push(poke);
        return filteredPokes;
      }

      /* Name will get overwritten by other filters */

      if (gen) { // if gen is present in search, search by gen first
        // get the initial gen list
        const genList = await this.fetchByGeneration(gen);
        filteredPokes = await genList;

        /* ========== GEN ONLY ==========*/
        if (!type1 && !type2) {
          // filteredPokes = genList.filter((poke) => poke.gen === gen);
          filteredPokes.sort((p1, p2) => p1.id - p2.id);
          return filteredPokes;
        }

        /* ========== GEN + TYPE 1 + TYPE 2 ==========*/// GEN
        if (type1 && type2) {
          filteredPokes = filteredPokes.filter((poke) => poke.type1 === type1);
          filteredPokes = filteredPokes.filter((poke) => poke.type2 === type2);
          return filteredPokes;
        }

        /* ========== GEN + TYPE 1 ONLY ==========*/
        if (type1 && !type2) {
          filteredPokes = filteredPokes.filter((poke) => poke.type1 === type1);
          return filteredPokes;
        }

        /* ========== GEN+ TYPE 2 ONLY ==========*/
        if (!type1 && type2) {
          filteredPokes = filteredPokes.filter((poke) => poke.type2 === type2);
          return filteredPokes;
        }
      }
      if (!gen) {
        // else if gen is NOT present
        const typeList = await this.fetchByType(type1, 1); // get initial list by type

        filteredPokes = await typeList;

        /* ========== TYPE 1 + TYPE 2 ONLY ==========*/
        if (type1 && type2) {
          // filter out pokes that don't have a matching type 2
          filteredPokes = filteredPokes.filter((poke) => poke.type2 === type2);
          return filteredPokes;
        }

        /* ========== TYPE 1 ONLY ==========*/
        if (type1 && !type2) {
          return filteredPokes;
        }

        /* ========== TYPE 2 ONLY ==========*/
        if (!type1 && type2) {
          filteredPokes = await this.fetchByType(type2, 2);
          return filteredPokes;
        }
      }
    };

    await filterHandler();

    // returns array of filtered search results
    return filteredPokes;
  };

  /**
     * Fetches a Pokemon based on its name or ID.
     *
     * @param {string} searchNameID - The name or ID of the Pokemon.
     * @return {Promise<Pokemon>} - Returns a promise that resolves to a Pokemon object
     */
  async fetchByNameOrID(searchNameID) {
    try {
      const nameRes = await fetch(`${API_ROOT}/pokemon/${searchNameID}/`);
      if (nameRes.ok) {
        const pokeData = await nameRes.json();

        return await this.buildPokeObj(pokeData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
     * Responsible for fetching and creating a list of Pokemon objects
     * when the user applies filters that include "Gen".
     *
     * @param {string|number} searchGen - The generation of Pokemon to fetch.
     * @return {Promise<Pokemon[]>} - Returns a promise that resolves to an array of Pokemon objects from the specified generation.
     */
  async fetchByGeneration(searchGen) {
    try {
      const getGenOnlySearchResults = async () => {
        const genRes = await fetch(`${API_ROOT}/generation/${searchGen}/`);
        if (genRes.ok) {
          const genData = await genRes.json();

          const filteredGenPokes = [];

          for (const poke of genData.pokemon_species) {
            // getting rid of the -species in order to directly fetch pokemon
            const pokeURL = poke.url.replace('-species', '');

            // fetch with specific URL corresponding to the randomly chosen pokemon
            const pokeGenRes = await fetch(pokeURL);

            if (pokeGenRes.ok) {
              const genPokeData = await pokeGenRes.json();
              filteredGenPokes.push(this.buildPokeObj(genPokeData));
            }
          }
          // list of pokemon obj that meet the gen search criteria
          return filteredGenPokes;
        }
      };
      return await getGenOnlySearchResults();
    } catch (error) {
      console.error(error);
    }
  }

  /**
     * Responsible for fetching and creating a list of Pokemon objects based on applied type filters.
     * Similar to fetchByGeneration() but fetches Pokemon based on their type.
     *
     * @param {string} searchType - The Pokemon type to fetch.
     * @param {number} typeNum - Determines if it's the primary (1) or secondary (2) type.
     * @return {Promise<Pokemon[]>} - Returns a promise that resolves to an array of Pokemon objects matching the type filter.
     */
  async fetchByType(searchType, typeNum) {
    try {
      const getTypeOnlySearchResults = async () => {
        const typeRes = await fetch(`${API_ROOT}/type/${searchType}/`);
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          const filteredTypePokes = [];

          for (const poke of typeData.pokemon) {
            // if the slot number of the pokemon matches the typeNum we passed in (either 1 or 2)
            // slot determines if it is type1 or type 2
            if (poke.slot === typeNum) {
              const pokeTypeRes = await fetch(poke.pokemon.url); // fetch with specific URL corresponding to the randomly chosen pokemon
              if (pokeTypeRes.ok) {
                const typePokeData = await pokeTypeRes.json();
                filteredTypePokes.push(this.buildPokeObj(typePokeData));
              }
            }
          }
          return filteredTypePokes;
        }
      };
      return await getTypeOnlySearchResults();
    } catch (error) {
      console.error(error);
    }
  }

  /**
     * This function is used to create the object that stores the properties passed into the HBS in the html.
     *
     * @param {Object[]} pokeList - Array of Pokemon objects to be transformed.
     * @return {Promise<Pokemon[]>} - Returns a promise that resolves to an array of objects, that contain the properties
     * of the Pokemon that are currently being dealt with
     */
  async outputFilteredPokes(pokeList) {
    const pokeInfoList = [];
    for (const [, poke] of Object.entries(pokeList)) {
      pokeInfoList.push({
        pokename: this.formatPokeName(poke.name),
        pokeid: poke.id,
        pokesprite: poke.sprite,
        poketype1: this.capitalizeFirstLetter(poke.type1),
        poketype2: this.capitalizeFirstLetter(poke?.type2),
        multitype: poke.type2 !== undefined,
      });
    }
    return pokeInfoList;
  };

  /**
     * Method that can be used for constructing a Pokemon object from the JSON data
     * @param {Object} pokeData - JSON Object corresponding to the current random Pokemon
     * @return {Pokemon} - Pokemon to add to the rndmPokes array
     */
  buildPokeObj(pokeData) {
    // console.log(pokeData);
    const pokemon = new Pokemon(
        pokeData.name,
        pokeData.id,
        pokeData.sprites?.front_default,
        pokeData.stats,
        pokeData.types[0].type.name,
    );

    if (pokeData.types.length > 1) {
      pokemon.type2 = pokeData.types[1].type.name;
    }

    return pokemon;
  }

  /**
     * Main method that will format the Pokemon names with a capitalized first letter;
     * @param {string} name - The Pokemon name
     * @return {string} - The formatted Pokemon name
     */
  formatPokeName(name) {
    if (!name.includes(' ') && !name.includes('.') && !name.includes('-')) {
      return this.capitalizeFirstLetter(name);
    }
    let formattedName = this.handleOddCharsInName(name, ' ');
    formattedName = this.handleOddCharsInName(formattedName, '-');

    return formattedName.trim();
  }

  /**
     * Helper method to format Pokemon names containing special characters.
     * If no changes are made, returns the original name.
     *
     * @param {string} nameVal - The name to format.
     * @param {string} char - The character to split the string at.
     * @return {string} - The formatted name or the original if no changes are made.
     */
  handleOddCharsInName(nameVal, char) {
    let fixedName = '';
    if (nameVal.includes(char)) {
      const nameArr = nameVal.split(char);

      // if name has '-' or '.' or ' ', it will capitalize each name, and put it back together without
      // the non-letter character
      for (const str of nameArr) {
        fixedName += this.capitalizeFirstLetter(str) + char;
      }
      // return the fixed name
      return fixedName.substring(0, fixedName.length - 2);
    } else return nameVal; // no changes made
  }

  /**
     * Helper method for capitalizing the first letter of a word.
     * Designed for formatting Pokemon names and Types.
   *
     * @param {string} value - String you would like to capitalize the first letter of
     * @return {string} - The formatted name
     */
  capitalizeFirstLetter(value) {
    if (value === null || value === undefined) {
      return value;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}


module.exports = PowerPoke;
