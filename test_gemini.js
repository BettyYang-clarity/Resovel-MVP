const key = 'AIzaSyAbKqX5JlQ6dCcLMQ9GqSo9ckWIzWu9ZzQ';
async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  if (data.models) {
    const flashModels = data.models.filter(m => m.name.includes('flash')).map(m => m.name);
    console.log("Flash models:", flashModels);
  } else {
    console.log(data);
  }
}
test();
