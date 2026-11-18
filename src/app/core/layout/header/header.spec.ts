import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [Header], providers: [provideRouter([])] });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, navigate, element };
  }

  function submit(element: HTMLElement, value: string) {
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')?.dispatchEvent(new Event('submit'));
  }

  it('navigates to /search with the trimmed keyword', () => {
    const { element, navigate } = setup();
    submit(element, '  洗衣機  ');
    expect(navigate).toHaveBeenCalledWith(['/search'], { queryParams: { keyword: '洗衣機' } });
  });

  it('ignores blank searches', () => {
    const { element, navigate } = setup();
    submit(element, '   ');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('searches a hot keyword on click', () => {
    const { element, navigate } = setup();
    element.querySelector<HTMLButtonElement>('.hot-keywords button')?.click();
    expect(navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { keyword: '國際牌 洗衣機' },
    });
  });
});
