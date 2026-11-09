import owlMark from "../assets/owl-d.png";

export function BrandMark({ onNavigate, className = "title" }) {
  function handleClick(event) {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate("/");
  }

  return <a className={className} href="/" onClick={handleClick} aria-label="DataOwls home">
    <img src={owlMark} alt="D" className="logo-owl" />
    <span className="logo-letter">a</span><span className="logo-letter">t</span><span className="logo-letter">a</span><span className="logo-letter">O</span><span className="logo-letter">w</span><span className="logo-letter">l</span><span className="logo-letter">s</span>
  </a>;
}
