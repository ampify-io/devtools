const url = new URL(location.href);

location.href = url.searchParams.get('r');
