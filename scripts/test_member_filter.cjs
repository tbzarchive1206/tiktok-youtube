const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = vm.createContext({ window: {}, document: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context);
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
vm.runInContext(source.slice(0, source.indexOf('$("#accountFilter").addEventListener')), context);
const run = code => vm.runInContext(code, context);
for (const [video, member, expected] of [
  [{members:['Jacob','Kevin']}, 'Jacob', true],
  [{members:['Jacob'], description:'Eric', hashtags:'#ERIC'}, 'Eric', false],
  [{description:'Younghoon', hashtags:'#Q'}, 'Younghoon', false],
  [{members:['New']}, 'New', true],
  [{members:['Q']}, 'Q', true],
  [{members:['THE BOYZ']}, 'Eric', true],
  [{members:['All members']}, 'Eric', true],
  [{members:['Sunwoo']}, 'unknown', false],
  [{members:[]}, 'all', true],
  [{members:[]}, 'Eric', false],
  [{members:'Hyunjae, Hwall'}, 'Hwall', true],
]) {
  context.video = video; context.member = member;
  assert.equal(run('memberMatches(video, member)'), expected, JSON.stringify({video,member}));
}
run('Object.assign(state, {year:"2019", member:"Hyunjae", sort:"oldest"})');
assert.ok(run('filtered().some(v => v.tiktokId === "6643290671404813570")'));
assert.ok(run('filtered().every(v => v.year === 2019 && memberMatches(v, "Hyunjae"))'));
assert.equal(run('filtered()[0].date'), '2019-01-06');
run('state.account = "eric.sohn22"');
assert.equal(run('filtered().length'), 0);
console.log('Member filter regression checks passed.');
console.log(run('JSON.stringify({videos:VIDEOS.length, older:VIDEOS.filter(v=>v.year<2020).length, withMembers:VIDEOS.filter(v=>v.members.length).length, matches2019:MEMBER_OPTIONS.map(m=>({member:m.value,count:VIDEOS.filter(v=>v.year===2019 && memberMatches(v,m.value)).length}))})'));
