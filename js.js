const searchInput = document.querySelector('#search-input');
const dropdownContent = document.querySelector('.dropdown-content');
const addedReposList = document.querySelector('.gradientProjectItem:last-of-type');

let searchTimeout = null;
let currentSearchQuery = '';

async function searchRepositories(query) {
  if (!query) {
    dropdownContent.innerHTML = '';
    return [];
  }

  try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Ошибка при поиске репозиториев:', error);
    return [];
  }
}

function displaySearchResults(repos) {
  dropdownContent.innerHTML = '';

  if (repos.length === 0) {
    const noResultsItem = document.createElement('div');
    noResultsItem.className = 'itemSerch';
    noResultsItem.textContent = 'Репозитории не найдены.';
    noResultsItem.style.textAlign = 'center';
    dropdownContent.appendChild(noResultsItem);
    return;
  }

  repos.forEach(repo => {
    const itemElement = document.createElement('div');
    itemElement.className = 'itemSerch';

    itemElement.dataset.repoName = repo.name;
    itemElement.dataset.ownerLogin = repo.owner.login;
    itemElement.dataset.starsCount = repo.stargazers_count;

    itemElement.textContent = repo.name;

    dropdownContent.appendChild(itemElement);
  });
}

function addRepositoryToList(repoName, repoOwner, repoStars) {
  const emptyRepoInfo = addedReposList.querySelector('.repoInfo:empty');

  if (emptyRepoInfo) {
    const fullText = `Name: ${repoName} <br> Owner: ${repoOwner} <br> Stars: ${repoStars}`;
    emptyRepoInfo.innerHTML = fullText;

    const repoListParent = emptyRepoInfo.closest('.RepoList');
    if (repoListParent) {
      const crossInfoToShow = repoListParent.querySelector('.crossInfo');
      if (crossInfoToShow) {
        crossInfoToShow.classList.remove('show');
      }
    }
  }
}

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();

  if (searchTimeout) clearTimeout(searchTimeout);
  if (query === '') { dropdownContent.innerHTML = ''; currentSearchQuery = ''; return; }

  searchTimeout = setTimeout(async () => {
    if (query !== currentSearchQuery) {
      currentSearchQuery = query;
      const repos = await searchRepositories(query);
      displaySearchResults(repos);
    }
  }, 3000);
});

dropdownContent.addEventListener('click', (e) => {
  if (e.target.classList.contains('itemSerch')) {
    const repoName = e.target.dataset.repoName;
    const ownerLogin = e.target.dataset.ownerLogin;
    const starsCount = e.target.dataset.starsCount;

    addRepositoryToList(repoName, ownerLogin, starsCount);
  }
});

addedReposList.addEventListener('click', (e) => {
  if (e.target.closest('.cross')) {
    const itemToClear = e.target.closest('.item');
    if (itemToClear) {
      itemToClear.querySelector('.repoInfo').textContent = '';
      itemToClear.querySelector('.crossInfo').classList.add('show');
    }
  }
});